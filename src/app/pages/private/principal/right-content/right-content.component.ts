import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Report } from '../../board/board.model';
import { loopback } from '../../../../models/common/loopback.model';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from '../../../../services/auth.service';

import * as moment from 'moment';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { PreviewDialogComponent } from '../../preview-dialog/preview-dialog.component';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';

@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {

    @Output() valueChange = new EventEmitter();

    public calendarOpen: boolean = false;
    public startDate: any;
    public endDate: any;

    user: any = {};
    icurrentObj: {
        currentFolder: null,
        currentState: null,
        deletedFg: false,
        currentStateName: 'Todos Informes'
    };

    ifilter: string;
    ifilterdate: any;
    ifilterreviewed: boolean = true;

    public list: any = {
        reports: [],
        folders: []
    }
    public pager: any = {
        limit: 10,
        selected: 1,
        totalItems: 0,
        totalPages: 0,
        pages: []
    }
    public listForm: FormGroup;

    @Input()
    set currentObj(value: any) {
        this.icurrentObj = value;

        if (this.icurrentObj) {
            this.loadReports(this.ifilter);
        }
    }

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpService,
        private auth: AuthService,
        private folderService: AsideFoldersService
    ) {
        this.listForm = new FormGroup({
            'reports': new FormArray([])
        });
        this.user = this.auth.getUserData();
    }

    toggleCalendar() {
        if (!this.calendarOpen) {
            this.calendarOpen = true;
        } else {
            this.calendarOpen = false;
        }
    }

    openDialog(): void {
        this.dialog.open(CreateReportDialogComponent, {
            width: '1500px',
            data: {
                'folderId': (this.icurrentObj.currentFolder ? this.icurrentObj.currentFolder : false),
                'stateId': '5e068d1cb81d1c5f29b62977'
            }
        });
    }

    ngOnInit() {
        this.loadReports();
        this.getFolders();
    }


    private saveReport(clone: any): void {
        this.http.post({
            'path': 'reports',
            'data': clone
        }).subscribe(() => {
        });
    }

    private deleteReport(id: string): void {
        this.http.patch({
            path: 'reports/' + id,
            data: {
                trash: true
            }
        }).subscribe(() => {
        });
    }

    private getFolders(): void {
        this.folderService.$listenFolders.subscribe((data: any) => {
            this.list.folders = data;
        })
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }

    public tabClick(event: any) {
        this.ifilterreviewed = (event.index === 0 ? true : false);
        this.loadReports(this.ifilter);
    }

    private loadPager(where: any): void {
        this.http.get({
            path: 'reports/count?where=',
            data: where
        }).subscribe((response: any) => {
            this.pager.totalItems = response.body.count;
            this.pager.totalPages = Math.ceil(this.pager.totalItems / this.pager.limit);
            this.pager.selected = 1;
            this.pager.pages = [];
            for (let i = 1; i <= this.pager.totalPages; i++) {
                this.pager.pages.push({
                    'skip': (i - 1) * this.pager.limit,
                    'index': i
                });
            }
        });
    }

    public getIFilterIds(endpoint: string, property: string, fn: any): void {
        let result: Array<string> = [];
        if (!this.ifilter) return fn(result);
        var query = new loopback();
        query.filter.where['name'] = { like: this.ifilter, options: "i" };
        query.filter.fields = { id: true };
        this.http.get({
            path: endpoint,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            result = response.body.map((a: any) => {
                let item: any = {};
                item[property] = a.id;
                return item;
            });
            fn(result);
        });
    }

    public loadReports(filter?: string | null, pager?: any): void {
        this.ifilter = filter;
        var query = new loopback();
        query.filter.where = { and: [] };
        query.filter.where['and'].push({ trash: typeof this.icurrentObj.deletedFg !== 'undefined' ? this.icurrentObj.deletedFg : false });
        query.filter.include.push(
            { relation: "folder" },
            { relation: "user" },
            { relation: "state" },
            { relation: "section" }
        );

        if (this.ifilterdate) {
            let start = moment(this.ifilterdate.start).subtract(5, 'hours').toISOString();
            let end = moment(this.ifilterdate.end).subtract(5, 'hours').toISOString();
            query.filter.where['and'].push({ updatedAt: { between: [start, end] } });
        }

        this.getIFilterIds('users', 'userId', (users: Array<any>) => {
            this.getIFilterIds('states', 'stateId', (states: Array<any>) => {
                this.getIFilterIds('sections', 'sectionId', (sections: Array<any>) => {
                    this.readReportsAsReviewer((reportsAsReviewer: Array<any>) => {
                        if (this.ifilter) {
                            let orWhere: Array<any> = [
                                { name: { like: this.ifilter, options: "i" } }
                            ].concat(users, states, sections);
                            query.filter.where['and'].push({ or: orWhere });
                        } else {
                            this.icurrentObj.currentFolder ? query.filter.where['and'].push({ folderId: this.icurrentObj.currentFolder }) : null;
                            this.icurrentObj.currentState ? query.filter.where['and'].push({ stateId: this.icurrentObj.currentState }) : null;
                        }

                        if(this.icurrentObj.currentState == '5e068d1cb81d1c5f29b62976' && this.ifilterreviewed) {
                            let iFilterReviewed = false;
                            query.filter.where['and'].push({ reviewed: iFilterReviewed });
                        }

                        if (this.ifilterreviewed) {
                            query.filter.where['and'].push({ ownerId: this.user.id });
                        } else {
                            query.filter.where['and'].push({ id: {inq: reportsAsReviewer} });
                        }

                        if (pager) {
                            query.filter.limit = this.pager.limit;
                            query.filter.skip = pager.skip;
                            this.pager.selected = pager.index;
                        } else {
                            this.loadPager(query.filter.where);
                            query.filter.limit = this.pager.limit;
                            query.filter.skip = 0;
                        }
                        query.filter.order = "id DESC";

                        this.clearCheckboxes(this.listForm.controls.reports as FormArray);
                        this.getReports(query);
                    });
                });
            });
        });
    }

    private getReports(query: any) {
        this.list.reports = [];
        this.http.get({
            path: `reports`,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            this.addCheckboxes(response.body);
            setTimeout(() => {
                this.list.reports = response.body;
            }, 100);
        });
    }

    private addCheckboxes(reports: Array<any>): void {
        for (let iReport in reports) {
            if (reports.hasOwnProperty(iReport)) {
                const control = new FormControl(false);
                (this.listForm.controls.reports as FormArray).push(control);
            }
        }
    }

    private clearCheckboxes(formArray: FormArray): void {
        while (formArray.length !== 0) {
            formArray.removeAt(0);
        }
    }

    public getCheckboxesSelected(): Array<any> {
        return this.listForm.value.reports
            .map((v: any, i: number) => v ? this.list.reports[i].id : null)
            .filter((v: any) => v !== null);
    }

    public moveReports(event: any): void {
        let selecteds: Array<string> = this.getCheckboxesSelected();
        let toUpdate: Array<any> = this.list.reports.filter((a: any) => {
            if (selecteds.indexOf(a.id) !== -1) {
                a.folderId = event.value;
                return true;
            }
            return false;
        });

        this.rcPutReport(toUpdate, 0, () => {
            let folder = this.list.folders.filter((a: any) => a.id == event.value)[0];
            if (!folder) return;
            this.valueChange.emit({
                state: this.icurrentObj.currentState,
                deleted: this.icurrentObj.deletedFg,
                folder: folder.id,
                stateName: folder.name
            });
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Su informe ha sido agregado exitosamente a:',
                    subtitle: folder.name
                }
            });

            this.folderService.loadFolders();
            this.folderService.loadStates();
            this.loadReports(this.ifilter);
            this.folderService.newActive = folder;
        });
    }

    public readReportsAsReviewer(fn: any): void {
        let result = [];
        if (this.ifilterreviewed) {
            return fn([]);
        }

        this.http.get({
            path: `users/${this.user.id}/reportsr`,
            data: { "fields": "id" },
            encode: true
        }).subscribe(
            (response: any) => {
                result = response.body.map((a: any) => a.id);
                fn(result);
            },
            () => {
                alert('Oops!!! \nNo cargamos tus datos. Intenta más tarde');
            }
        );
    }

    public deleteReports(): void {
        let selecteds: Array<string> = this.getCheckboxesSelected();
        let toUpdate: Array<any> = this.list.reports.filter((a: any) => {
            if (selecteds.indexOf(a.id) !== -1) {
                a.trash = true;
                return true;
            }
            return false;
        });

        this.rcPutReport(toUpdate, 0, () => {
            this.loadReports(this.ifilter);
        });
    }

    private rcPutReport(reports: Array<any>, index: number, fn: any): void {
        if (index == reports.length) {
            fn();
            return;
        }
        let report: any = reports[index];
        let data: Report = {
            'id': report.id,
            'name': report.name,
            'slug': report.slug,
            'trash': report.trash,
            'content': report.content,
            'styles': report.styles,
            'sectionTypeKey': report.sectionTypeKey,
            'templateId': report.templateId,
            'stateId': report.stateId,
            'sectionId': report.sectionId,
            'folderId': report.folderId
        };
        this.http.patch({
            'path': `reports/${data.id}`,
            'data': data
        }).subscribe(
            () => {
                index++;
                this.rcPutReport(reports, index, fn);
            },
            () => {
                alert('Oops!!! \nNo actualizamos tus datos. Intenta más tarde');
            }
        );
    }

    public filterReports(text: string) {
        this.loadReports(text);
    }

    public filterDateReports() {
        this.ifilterdate = {
            start: this.startDate,
            end: this.endDate
        };

        this.calendarOpen = false;
        this.loadReports(this.ifilter);
    }

    public onDateUpdate(event: any) {
        this.startDate = event.startDate.toString();
        this.endDate = event.endDate.toString().replace('00:00:00', '23:59:59');
    }

    isFiltering() {
        return this.icurrentObj.currentFolder || this.icurrentObj.currentState ||
            this.icurrentObj.deletedFg;
    }

    cleanFilters() {
        this.icurrentObj = {
            currentFolder: null,
            currentState: null,
            deletedFg: false,
            currentStateName: 'Todos Informes'
        };
        this.loadReports();
        this.valueChange.emit(null);
    }

    public onCloneReport(pos: number) {
        let clone = Object.assign({}, this.list.reports[pos]);
        clone.name = clone.name + ' Copia';
        clone.slug = clone.slug + '-copia';
        this.list.reports.splice(pos + 1, 0, clone);

        let newReport: any = {
            name: clone.name,
            slug: clone.slug,
            trash: clone.trash,
            content: clone.content,
            sectionTypeKey: clone.sectionTypeKey,
            templateId: clone.templateId,
            userId: clone.userId,
            stateId: clone.stateId,
            sectionId: clone.sectionId,
            folderId: clone.folderId
        };

        this.saveReport(newReport);
    }

    public onDeleteReport(pos: number) {
        let reportId = this.list.reports[pos].id;
        this.list.reports.splice(pos, 1);

        this.deleteReport(reportId);
    }

     public openPreviewDialog(idReport): void {
        var paramsDialog = {
            width: '80vw',
            height: '80vh',
            data: {
                'reportId': idReport,
                'styles': '',
                'content': ''
            }
        };

        this.dialog.open(PreviewDialogComponent, paramsDialog);
    }

}

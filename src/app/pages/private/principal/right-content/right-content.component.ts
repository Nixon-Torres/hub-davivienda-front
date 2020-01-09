import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { HttpService } from '../../../../services/http.service';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { Router } from '@angular/router';
import { loopback } from '../../../../models/common/loopback.model';
import * as qs from 'qs';
import * as moment from 'moment';

@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {

    @Output() valueChange = new EventEmitter();

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
        reports: []
    }

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
        private http: HttpService
    ) {
    }

    openDialog(): void {
        this.dialog.open(CreateReportDialogComponent, {
            width: '1500px',
            data: {
                'folderId': (this.icurrentObj.currentFolder ? this.icurrentObj.currentFolder: false),
                'stateId': '5e068d1cb81d1c5f29b62977'
            }
        });
    }

    ngOnInit() {
        this.loadReports();
    }


    private saveReport(clone): void {
        this.http.post({
            'path': 'reports',
            'data': clone
        }).subscribe((response) => {
        });
    }

    private deleteReport(id): void {
        this.http.delete({
            'path': 'reports/' + id
        }).subscribe((response) => {
        });
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }

    public tabClick(event: any) {
        this.ifilterreviewed = (event.index === 0 ? true : false);
        this.loadReports(this.ifilter);
    }

    private loadReports(filter?: string | null): void {
        this.ifilter = filter;
        var query = new loopback();
        query.filter.include.push({ relation: "folder" }, { relation: "user" }, { relation: "state" }, { relation: "section" })
        query.filter.where['folderId'] = this.icurrentObj.currentFolder;
        query.filter.where['stateId'] = this.icurrentObj.currentState;
        query.filter.where['trash'] = this.icurrentObj.deletedFg;
        query.filter.where['reviewed'] = this.ifilterreviewed;
        this.ifilter ? query.filter.where['name'] = { like: this.ifilter } : null;
        if (this.ifilterdate) {
            let start = moment(this.ifilterdate.start).subtract(5, 'hours').toISOString();
            let end = moment(this.ifilterdate.end).subtract(5, 'hours').toISOString();
            query.filter.where['updatedAt'] = { between: [start, end] };
        }
        this.http.get({
            path: 'reports?' + qs.stringify(query, { skipNulls: true })
        }).subscribe((response) => {
            this.list.reports = response.body;
        });
    }

    public filterReports(text: string) {
        this.loadReports(text);
    }

    public filterDateReports(event: MatDatepickerInputEvent<Date>) {
        this.ifilterdate = {
            start: event.value.toString(),
            end: event.value.toString().replace('00:00:00', '23:59:59')
        };
        this.loadReports(this.ifilter);
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

    public onCloneReport(event: Event, pos: number) {
        event.preventDefault();

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

    public onDeleteReport(event: Event, pos: number) {

        let reportId = this.list.reports[pos].id;
        this.list.reports.splice(pos, 1);

        this.deleteReport(reportId);
    }

}

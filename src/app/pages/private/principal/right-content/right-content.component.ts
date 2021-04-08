import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormArray, FormControl, Form, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { environment } from '../../../../../environments/environment';
import { Report } from '../../board/board.model';
import { loopback } from '../../../../models/common/loopback.model';
import { PreviewDialogComponent } from '../../preview-dialog/preview-dialog.component';
import { HighlightDialogComponent } from '../highlight-dialog/highlight-dialog.component';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';

import * as moment from 'moment';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';
import { TagsDialogComponent } from '../tags-dialog/tags-dialog.component';
import { AddWordsDialogComponent } from '../add-words-dialog/add-words-dialog.component';
import { start } from 'repl';
import {concat, forkJoin, of, Subject, throwError, zip} from 'rxjs';
import {first, switchMap, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit, OnDestroy {

    @Output() valueChange = new EventEmitter();
    @Output() changeView = new EventEmitter();

    readonly DRAFT_KEY: string = environment.DRAFT_KEY;

    public calendarOpen = false;
    public startDate: any;
    public endDate: any;

    public category: any;
    public fullReportList: any;
    public categoryImageForm: FormGroup;
    public categoryFormFields: FormGroup;
    public editingCategory = false;

    user: any = {};
    icurrentObj: any = {
        currentFolder: null,
        currentState: null,
        currentCategory: null,
        currentSearch: null,
        deletedFg: false,
        currentStateName: 'Todos Informes'
    };

    ifilter: string;
    ifilterdate: any;
    ifilterreviewed = true;
    isReviewed: boolean;
    isFiltered = false;
    pendingToReview = false;
    public list: any = {
        reports: [],
        folders: [],
        reviewed: [],
        notReviewed: []
    };
    public pager: any = {
        limit: 10,
        selected: 1,
        totalItems: 0,
        totalPages: 0,
        pages: []
    };
    public listForm: FormGroup;
    public remarkable = false;
    public filterOptions: any;
    public marketing: boolean;
    public isBasicUser: boolean;
    public isAdvancedUser: boolean;
    public isMediumUser: boolean;
    public selects: FormGroup;
    public tabIndex = 0;
    public canClearFilters: boolean;
    public finishFilter = false;
    public path: any;
    private _destroyed$: Subject<any>;

    @Input()
    set currentObj(value: any) {
        this.icurrentObj = value;
        if (this.icurrentObj) {
            this.resetSelect();
            this.isFiltered = false;

            if (this.user && this.user.id) {
                if (!this.icurrentObj.currentCategory) {
                    this.category = null;
                    if (this.icurrentObj.currentSearch && this.isMobileVersion()) {
                        this.filterReports(this.icurrentObj.currentSearch);
                    } else {
                        this.loadReports(this.ifilter);
                    }
                } else {
                    this.loadCategory();
                }
            }

            if (this.icurrentObj.currentFolder || this.icurrentObj.currentState) {
                this.tabIndex = 0;
            }
        }
    }

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpService,
        private auth: AuthService,
        private folderService: AsideFoldersService,
        private formBuilder: FormBuilder
    ) {
        this.listForm = new FormGroup({
            reports: new FormArray([]),
            reviewed: new FormArray([])
        });

        this.categoryFormFields = new FormGroup({
            fullDescription: new FormControl('', Validators.required),
            metaTitle: new FormControl(''),
            metaDescription: new FormControl('')
        });
        this.categoryImageForm = this.formBuilder.group({
            image: [''],
        });

        this.auth.user.subscribe((user) => {
            this.user = user;

            if (!this.icurrentObj.currentCategory) {
                this.loadReports(this.ifilter);
            } else {
                this.loadCategory();
            }

            this.getFolders();
        });
        this.marketing = this.auth.isMarketing();
        this.isBasicUser = this.auth.isBasicUser();
        this.isAdvancedUser = this.user.roles.find(e => (e === 'Admin' || e === 'medium'));
        this.isMediumUser = this.user.roles.find(e => (e === 'medium'));
        this.selectsFn();
    }

    public isMobileVersion() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent));
    }

    public isTabletVersion() {
        const res = (/iPad|tablet/i.test(navigator.userAgent));
        return res;
    }

    public onFileSelect(event: any): void {
        if (event.target.files.length > 0) {
            const image = event.target.files[0];
            this.categoryImageForm.get('image').setValue(image);
        }
    }

    public onSaveCategory(event) {
        event.preventDefault();
        const path = `categories/${this.category.id}`;
        const f = this.categoryFormFields.controls;
        const formData = {
            fullDescription: f.fullDescription.value,
            metaTitle: f.metaTitle.value,
            metaDescription: f.metaDescription.value,
            mainReportId: this.category.mainReportId
        };

        this.http.patch({
            path,
            data: formData
        }).subscribe((resp: any) => {
            if (resp && resp.body) {

                const img = this.categoryImageForm.get('image');
                if (img && img.value !== '') {
                    return this.onSaveImage();
                }

                this.showDialogCategory();
            }
        });
    }

    private showDialogCategory() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'La categoría se ha guardado exitosamente',
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
        });
    }

    private onSaveImage() {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg'])));
        formData.append('file', this.categoryImageForm.get('image').value);
        formData.append('key', 'categoryBanner');
        formData.append('resourceId', this.category.id);
        if (this.category && this.category.files) {
            const img = this.category.files ? this.category.files.find(e => e.key === 'categoryBanner') : null;
            if (img) {
                formData.append('id', img.id);
            }
        }
        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((resp: any) => {
            if (resp) { }

            this.showDialogCategory();
        });
    }

    public selectsFn() {
        this.selects = new FormGroup({
            filterSelect: new FormControl('Escoger'),
        });
    }

    public resetSelect() {
        this.selects.reset({
            filterSelect: 'Escoger'
        });
    }

    toggleCalendar() {
        if (!this.calendarOpen) {
            this.calendarOpen = true;
        } else {
            this.calendarOpen = false;
        }
    }

    openDialog(): void {
        const createDialogRef = this.dialog.open(CreateReportDialogComponent, {
            width: '80vw',
            data: {
                folderId: (this.icurrentObj.currentFolder ? this.icurrentObj.currentFolder : false),
                stateId: '5e068d1cb81d1c5f29b62977'
            }
        });

        createDialogRef.afterClosed().subscribe((result: boolean) => {
            this.loadReports();
            this.folderService.loadStates();
            this.folderService.loadFolders();
        });
    }

    ngOnInit() {
        this._destroyed$ = new Subject<any>();
        this.setFilterOptions();
    }

    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public setFilterOptions() {
        this.filterOptions = [{
            value: 'Proceso de revisión',
            filter: false
        }, {
            value: 'Informes revisados',
            filter: true
        }];
    }

    private saveReport(clone: any): void {
        const type = clone && clone.type;
        const reportTypeId = clone && clone.reportTypeId;
        const duplicatedReport$ = this.http.post({
            path: `${type || reportTypeId ? 'reports' : 'contents'}`,
            data: clone
        }).pipe(
            switchMap(({body}: any) => {
                if (!body) {
                    return throwError('Report not found');
                }
                const reportBlocks = !!clone.blocks.length ? clone.blocks.map(block => (
                    this.http.post({
                        path: 'reports/' + body.id + '/blocks',
                        data: block
                    }).pipe(first())
                )) : [of('')];
                const reportRelated = !!clone.relateds.length ? clone.relateds.map(related => (
                    this.http.post({
                        path: 'reportsRelated',
                        data: {...related, reportId: body.id}
                    }).pipe(first())
                )) : [of('')];
                const reportFiles = !!clone.files.length ? clone.files.map(file => (
                    this.http.post({
                        path: `media/${file.id}/clone`,
                        data: {...file, resourceId: body.id}
                    }).pipe(first())
                )) : [of('')];
                const reportGlossary = !!clone.glossary.length ? clone.glossary.map(word => (
                    this.http.put({
                        path: 'reports/' + body.id + '/glossary/rel/' + word.id
                    }).pipe(first())
                )) : [of(clone.glossary)];
                return zip(
                    of(body),
                    forkJoin(concat(...reportBlocks), ...reportRelated, ...reportFiles, ...reportGlossary)
                );
            }),
            first(),
            takeUntil(this._destroyed$)
        );
        duplicatedReport$.subscribe(
            () => {

                this.loadReports();
                this.folderService.loadStates();
                this.folderService.loadFolders();
            },
            (error) => console.error(error)
        );
    }

    private getFolders(): void {
        this.folderService.$listenFolders.subscribe((data: any) => {
            this.list.folders = data.filter((a: any) => a.id !== 'shared');
        });
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }

    public tabClick(event: any) {
        this.ifilterreviewed = (event.index === 0);
        this.loadReports(this.ifilter);
        this.isFiltered = false;
        this.resetSelect();
        if (!this.ifilterreviewed) {
            this.cleanFilters();
        }
    }

    public reviewedFilter(event) {
        this.isFiltered = true;
        this.isReviewed = event.filter;
        this.loadReports(this.ifilter);
    }

    public reviewredFilter(list, isReviewed) {
        return list.filter((element) => element.reviewed === isReviewed);
    }

    public getNotReviewed(reportList) {
        if (!this.isFiltered) {
            this.list.reports = this.reviewredFilter(reportList, false);
        }
        const res = this.reviewredFilter(reportList, true);
        return res;
    }

    private loadPager(where: any, path?: any): void {
        this.http.get({
            path: !path ? 'reports/count?where=' : `users/${this.user.id}/reportsa/count`,
            data: !path ? where : ''
        }).subscribe((response: any) => {
            this.pager.totalItems = response.body.count;
            this.pager.totalPages = Math.ceil(this.pager.totalItems / this.pager.limit);
            this.pager.selected = 1;
            this.pager.pages = [];
            for (let i = 1; i <= this.pager.totalPages; i++) {
                this.pager.pages.push({
                    skip: (i - 1) * this.pager.limit,
                    index: i
                });
            }
            this.refreshPager();
        });
    }

    refreshPager() {
        const max = this.isMobileVersion() ? 6 : 10;
        const list = this.getPageList(this.pager.totalPages, this.pager.selected, max);
        this.pager.filterPages = list.map(e => {
          const item = this.pager.pages.find((j, idx) => e === (idx + 1));
          return item ? item : {index: '...'};
        });
    }

    getPageList(totalPages, page, maxLength) {
        if (maxLength < 5) {
            throw new Error('maxLength must be at least 5');
        }

        const range = (istart, iend) => {
            return Array.from(Array(iend - istart + 1), (_, i) => i + istart);
        }

        const sideWidth = maxLength < 9 ? 1 : 2;
        const leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
        const rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
        if (totalPages <= maxLength) {
            // no breaks in list
            return range(1, totalPages);
        }
        if (page <= maxLength - sideWidth - 1 - rightWidth) {
            // no break on left of page
            return range(1, maxLength - sideWidth - 1)
                .concat(0, range(totalPages - sideWidth + 1, totalPages));
        }
        if (page >= totalPages - sideWidth - 1 - rightWidth) {
            // no break on right of page
            return range(1, sideWidth)
                .concat(0, range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages));
        }
        // Breaks on both sides
        return range(1, sideWidth)
            .concat(0, range(page - leftWidth, page + rightWidth),
                0, range(totalPages - sideWidth + 1, totalPages));
    }

    public getIFilterIdsPromise(endpoint: string, property: string): Promise<any> {
        return new Promise((res) => {
            let result: Array<string> = [];
            if (!this.ifilter) {
                return res(result);
            }
            const query = new loopback();
            query.filter.where = { name: { like: this.ifilter, options: 'i' } };
            query.filter.fields = { id: true };
            this.http.get({
                path: endpoint,
                data: query.filter,
                encode: true
            }).subscribe((response: any) => {
                result = response.body.map((a: any) => {
                    const item: any = {};
                    item[property] = a.id;
                    return item;
                });
                res(result);
            });
        });
    }

    public getIFilterIds(endpoint: string, property: string, fn: any): void {
        let result: Array<string> = [];
        if (!this.ifilter) {
            return fn(result);
        }
        const query = new loopback();
        query.filter.where.name = { like: this.ifilter, options: 'i' };
        query.filter.fields = { id: true };
        this.http.get({
            path: endpoint,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            result = response.body.map((a: any) => {
                const item: any = {};
                item[property] = a.id;
                return item;
            });
            fn(result);
        });
    }

    private onCategoryOptionsSelected(report: any): void {
        this.category.mainReportId = report.id;
    }

    private loadCategory(): void {
        this.http.get({
            path: `categories/${this.icurrentObj.currentCategory}`,
            data: {
                include: ['childrenMainReportTypes', 'files', 'mainReport']
            },
            encode: true
        }).subscribe((response: any) => {
            this.category = response.body;

            this.categoryFormFields.setValue({
                fullDescription: this.category.fullDescription ? this.category.fullDescription : '',
                metaTitle: this.category.metaTitle ? this.category.metaTitle : '',
                metaDescription: this.category.metaDescription ? this.category.metaDescription : '',
            });
            this.loadReports(this.ifilter);
        });
    }

    public loadReports(filter?: string | null, pager?: any): void {
        this.ifilter = filter;
        const query = new loopback();
        query.filter.where = { and: [] };
        query.filter.where.and.push({ trash: typeof this.icurrentObj.deletedFg !== 'undefined' ? this.icurrentObj.deletedFg : false });
        query.filter.include.push(
            { relation: 'folder' },
            { relation: 'user' },
            { relation: 'state' },
            { relation: 'section' }
        );

        if (this.ifilterdate) {
            const start = moment(this.ifilterdate.start).subtract(5, 'hours').toISOString();
            const end = moment(this.ifilterdate.end).subtract(5, 'hours').toISOString();
            query.filter.where.and.push({ updatedAt: { between: [start, end] } });
        }

        if (this.marketing) {
            this.icurrentObj.currentState = '5e068c81d811c55eb40d14d0';
        }

        let users, states, sections;
        this.getRelatedResources().then((res: any) => {
            users = res.users;
            states = res.states;
            sections = res.sections;
            this.readReportsAsReviewer((reportsAsReviewer: Array<any>) => {
                // ifilter is used for the input search, if defined the query must include
                // the related resources found (users, states and sections)
                if (this.ifilter) {
                    // First filter is used to search by report name, then it adds the others
                    let orWhere: Array<any> = [
                        { name: { like: this.ifilter, options: 'i' } }
                    ].concat(users, sections);

                    // Only insert state condition if its not filtering by state already
                    if (!this.icurrentObj.currentState) {
                        orWhere = orWhere.concat(states);
                    }
                    query.filter.where.and.push({ or: orWhere });
                }

                // Include the folderId filter, only if we are not searching in the shared folder
                if (this.icurrentObj.currentFolder && this.icurrentObj.currentFolder !== 'shared') {
                    query.filter.where.and.push({ folderId: this.icurrentObj.currentFolder });
                }

                if (this.category) {
                    query.filter.where.and.push({
                        reportTypeId: {
                            inq: this.category.childrenMainReportTypes.map(e => e.id)
                        }
                    });
                }

                // If currentState is set (filtering by state), include it
                if (this.icurrentObj.currentState) {
                    this.resetSelect();
                    query.filter.where.and.push({ stateId: this.icurrentObj.currentState });
                }

                let pendingWhere;
                if (this.icurrentObj.currentFolder && this.icurrentObj.currentFolder === 'shared') {
                    query.filter.include.push({ relation: 'authors' });
                } else {
                    if (this.icurrentObj.currentState === '5e068d1cb81d1c5f29b62976' && this.ifilterreviewed) {
                        const iFilterReviewed = false;
                        query.filter.where.and.push({ reviewed: iFilterReviewed });
                    }
                    pendingWhere = JSON.parse(JSON.stringify(query.filter.where));
                    if (this.ifilterreviewed) {
                        pendingWhere.and.push({ id: 'just_reviewer'});
                        pendingWhere.and.push({ reviewed: false });
                        this.pendignForReview(pendingWhere);
                        if (!this.marketing) {
                            query.filter.where.and.push({ ownerId: this.user.id });
                        }
                    } else {
                        query.filter.where.and.push({ id: 'just_reviewer' });
                        if (this.isFiltered) {
                            query.filter.where.and.push({ reviewed: this.isReviewed });
                        }
                    }
                }

                if (pager) {
                    query.filter.limit = this.pager.limit;
                    query.filter.skip = pager.skip;
                    this.pager.selected = pager.index;
                    this.refreshPager();
                } else {
                    this.loadPager(query.filter.where, this.icurrentObj.currentFolder === 'shared');
                    query.filter.limit = this.pager.limit;
                    query.filter.skip = 0;
                }
                query.filter.order = 'id DESC';

                this.clearCheckboxes(this.listForm.controls.reports as FormArray);
                this.clearCheckboxes(this.listForm.controls.reviewed as FormArray);
                this.getReports(query);
            });
        });
    }

    private getRelatedResources() {
        return new Promise((res) => {
            let users;
            let states;
            let sections;
            this.getIFilterIdsPromise('users', 'ownerId')
                .then((pusers) => {
                    users = pusers;
                    return this.getIFilterIdsPromise('sections', 'sectionId');
                })
                .then((psections) => {
                    sections = psections;
                    if (!this.icurrentObj.currentState) {
                        return this.getIFilterIdsPromise('states', 'stateId');
                    }
                    return [];
                })
                .then((pstates) => {
                    states = pstates;
                    return res({
                        users,
                        states,
                        sections
                    });
                });
        });
    }

    private getFullReportList(query) {
        const path = 'reports';
        query.filter.fields = ['id', 'name'];
        delete query.filter.include;
        delete query.filter.skip;
        delete query.filter.limit;
        this.http.get({
            path,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            this.fullReportList = response.body.sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                if (b.name.toLowerCase() > a.name.toLowerCase()) {
                    return -1;
                }
                return 0;
            });
        });
    }

    private getReports(query: any) {
        this.finishFilter = false;
        const path = (this.icurrentObj.currentFolder && this.icurrentObj.currentFolder === 'shared') ?
            `users/${this.user.id}/reportsa` : 'reports';

        const pathContents = `contents`;
        this.list.reports = [];

        const observables = this.http.get({ path, data: query.filter, encode: true });
        const observables2 = this.http.get({
            path: pathContents,
            data: {
                include: ['lastUpdater'],
                limit: query.filter.limit,
                order: query.filter.order,
                skip: query.filter.skip,
                where: {
                    key: 'multimedia',
                    trash: typeof this.icurrentObj.deletedFg !== 'undefined' ? this.icurrentObj.deletedFg : false,
                },
            },
            encode: true
        });

        forkJoin([observables, observables2]).subscribe((results: any) => {
            const reports = results && results[0] && results[0].body
                ? results[0].body
                : [];
            const contents = results && results[1] && results[1].body
                ? results[1].body
                : [];
            this.startDate = null;
            this.endDate = null;
            let finisher = null;
            clearTimeout(finisher);
            setTimeout(() => {
                this.list.reports = reports;
                if (this.icurrentObj.deletedFg) {
                    contents.map(con => {
                        con.name = con.title || '';
                        con.user = {
                            name: con.lastUpdater && con.lastUpdater.name
                                ? con.lastUpdater.name
                                : ''
                        };
                        con.state = {
                            color: 'gray',
                            name: 'Multimedia'
                        };
                        return con;
                    });
                    this.list.reports = this.list.reports.concat(contents);
                }
                this.addCheckboxes(this.list.reports);
                if (!this.ifilterreviewed && !this.icurrentObj.currentState) {
                    this.list.reviewed = this.getNotReviewed(this.list.reports);
                }

                if (this.category) {
                    this.getFullReportList(query);
                }
            }, 100);
            finisher = setTimeout(() => {
                this.finishFilter = true;
            }, 2000);
        });
    }

    public pendignForReview(where: any) {
        this.http.get({
            path: 'reports/count?where=',
            data: where
        }).subscribe((response: any) => {
            this.pendingToReview = response.body.count > 0;
        });
    }

    private addCheckboxes(reports: any): void {
        for (const iReport in reports) {
            if (reports.hasOwnProperty(iReport)) {
                const control = new FormControl(false);

                if (this.ifilterreviewed || (!this.ifilterreviewed && !reports[iReport].reviewed)) {
                    (this.listForm.controls.reports as FormArray).push(control);
                } else {
                    (this.listForm.controls.reviewed as FormArray).push(control);
                }
            }
        }
    }

    private clearCheckboxes(formArray: FormArray): void {
        while (formArray.length !== 0) {
            formArray.removeAt(0);
        }
    }

    public getCheckboxesSelected(): Array<any> {
        let rsp = this.listForm.value.reports
            .map((v: any, i: number) => v ? this.list.reports[i] : null)
            .filter((v: any) => v !== null);

        rsp = rsp.concat(this.listForm.value.reviewed
            .map((v: any, i: number) => v ? this.list.reviewed[i] : null)
            .filter((v: any) => v !== null));

        return rsp.map(e => e.id);
    }

    public moveReports(event: any): void {
        const selecteds: Array<string> = this.getCheckboxesSelected();
        const toUpdate: Array<any> = this.list.reports.filter((a: any) => {
            if (selecteds.indexOf(a.id) !== -1) {
                a.folderId = event.value;
                return true;
            }
            return false;
        });

        this.rcPutReport(toUpdate, 0, () => {
            const folder = this.list.folders.filter((a: any) => a.id === event.value)[0];
            if (!folder) {
                return;
            }
            this.valueChange.emit({
                state: this.icurrentObj.currentState,
                deleted: this.icurrentObj.deletedFg,
                folder: folder.id,
                stateName: folder.name
            });
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    config: {
                        title: 'Su informe ha sido agregado exitosamente a:',
                        subtitle: folder.name
                    }
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

        // TODO (jjescof): This query is not needed anymore as it is forcing ids
        // server side with just_reviwer flag
        this.http.get({
            path: `users/${this.user && this.user.id ? this.user.id : ''}/reportsr`,
            data: { fields: 'id', limit: 1 },
            encode: true
        }).subscribe(
            (response: any) => {
                result = response.body.map((a: any) => a.id);
                fn(result);
            },
            () => {
            }
        );
    }

    public restoreReports(): void {
        const selecteds: Array<string> = this.getCheckboxesSelected();
        const toUpdate: Array<any> = this.list.reports.filter((a: any) => {
            if (selecteds.indexOf(a.id) !== -1) {
                a.trash = false;
                return true;
            }
            return false;
        });

        this.rcPutReport(toUpdate, 0, () => {
            this.loadReports(this.ifilter);
            this.folderService.loadFolders();
            this.folderService.loadStates();
        });
    }

    public deleteReports(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Esta seguro que desea eliminar el reporte?'
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (!result) {
                return;
            }
            const selecteds: Array<string> = this.getCheckboxesSelected();
            const toUpdate: Array<any> = this.list.reports.filter((a: any) => {
                if (selecteds.indexOf(a.id) !== -1) {
                    a.trash = true;
                    return true;
                }
                return false;
            });

            this.rcPutReport(toUpdate, 0, () => {
                this.loadReports(this.ifilter);
                this.folderService.loadFolders();
                this.folderService.loadStates();
            });
        });
    }

    public deleteAllReports(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Esta seguro que desea vaciar la papelera?',
                    titleStyle: {
                        'font-weight': 'bold'
                    }
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (!result) {
                return;
            }

            const observables = this.http.get({
                path: 'reports/',
                data: {
                    where: {
                        ownerId: this.user.id,
                        trash: true
                    },
                    fields: ['id', 'type']
                },
                encode: true
            });
            const observables2 = this.http.get({
                path: 'contents',
                data: {
                    include: ['lastUpdater'],
                    where: {
                        key: 'multimedia',
                        trash: true
                    },
                    fields: ['id', 'type']
                },
                encode: true
            });

            forkJoin([observables, observables2]).subscribe((results: any) => {
                const reportsBody = results && results[0] && results[0].body
                    ? results[0].body
                    : [];
                const contents = results && results[1] && results[1].body
                    ? results[1].body
                    : [];
                if ((!reportsBody || !reportsBody.length) && (!contents || !contents.length)) {
                    return;
                }
                const reports = reportsBody.concat(contents);
                const toDelete = reports.map((a: any) => a.id);
                this.rcDeeplyDeleteReport(toDelete, 0, () => {
                    this.loadReports(this.ifilter);
                }, reports);
            }, (error: any) => {
                console.error(error);
            });
        });
    }

    public deeplyDeleteReports(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Esta seguro que desea eliminar el contenido?',
                    titleStyle: {
                        'font-weight': 'bold'
                    }
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (!result) {
                return;
            }
            const reports: Array<string> = this.getCheckboxesSelected();
            let rsp = this.listForm.value.reports
                .map((v: any, i: number) => v ? this.list.reports[i] : null)
                .filter((v: any) => v !== null);

                rsp = rsp.concat(this.listForm.value.reviewed
                    .map((v: any, i: number) => v ? this.list.reviewed[i] : null)
                    .filter((v: any) => v !== null));
            this.rcDeeplyDeleteReport(reports, 0, () => {
                this.loadReports(this.ifilter);
            },rsp);
        });
    }

    public rcDeeplyDeleteReport(reportsId: Array<any>, index: number, fn: any, reports?: any) {
        if (index === reportsId.length) {
            return fn();
        }
        const report = reportsId[index];
        if (reports[0].state.name != "Multimedia") {
            this.path = reports[index] && 'reports';
        }
        this.http.delete({
            path: `${this.path ? 'reports' : 'contents'}/${report}`
        }).subscribe(() => {
            index++;
            this.rcDeeplyDeleteReport(reportsId, index, fn, reports);
        }, (error: any) => {
            console.error(error);
        });
    }

    private rcPutReport(reports: Array<any>, index: number, fn: any): void {
        if (index === reports.length) {
            fn();
            return;
        }
        const report: any = reports[index];
        const type = report && report.type;
        const reportTypeId = report && report.reportTypeId;
        const data = type || reportTypeId ? {
            id: report.id,
            name: report.name,
            slug: report.slug,
            trash: report.trash,
            content: report.content,
            styles: report.styles,
            reportTypeId: report.reportTypeId,
            templateId: report.templateId,
            stateId: report.stateId,
            sectionId: report.sectionId,
            folderId: report.folderId
        } : report;

        this.http.patch({
            path: `${type || reportTypeId ? 'reports' : 'contents'}/${data.id}`,
            data
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
        this.canClearFilters = text.length > 0;
        this.loadReports(text);
    }

    public filterDateReports() {
        this.ifilterdate = {
            start: this.startDate,
            end: this.endDate ? this.endDate : this.startDate.toString().replace('00:00:00', '23:59:59')
        };
        this.calendarOpen = false;
        this.loadReports(this.ifilter);
    }

    public onDateUpdate(event: any) {
        this.canClearFilters = event;
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
        this.ifilterdate = null;
        this.startDate = '';
        this.endDate = '';
        this.loadReports();
        this.valueChange.emit(null);
        this.resetSelect();
        this.canClearFilters = false;
    }

    public onCloneReport(pos: number, isReviewed: boolean = false) {
        let clone = null;
        if(isReviewed)
            clone = Object.assign({}, this.list.reviewed[pos]);
        else
            clone = Object.assign({}, this.list.reports[pos]);
        clone.name = `Duplicado ${clone.name}`;
        clone.slug = `duplicado-${clone.slug}`;
        this.http.get({
            path: 'reports',
            data: {
                where: {
                    id: clone.id,
                },
                limit: 1,
                include: ['blocks', 'relateds', 'files', 'glossary']
            },
            encode: true
        })
            .pipe(
                first(),
                takeUntil(this._destroyed$)
            )
            .subscribe(({body}) => {
                clone.blocks = !!body[0].blocks.length ? body[0].blocks.map(block => {
                    delete block.id;
                    delete block.reportId;
                    return block;
                }) : body[0].blocks;
                clone.relateds = !!body[0].relateds.length ? body[0].relateds.map(related => {
                    delete related.reportId;
                    delete related.id;
                    return related;
                }) : body[0].relateds;
                clone.files = !!body[0].files.length ? body[0].files.map(file => {
                    delete file.resourceId;
                    return file;
                }) : body[0].files;
                clone.glossary = !!body[0].glossary.length ? body[0].glossary : [];

                const type = clone && clone.type;
                const reportTypeId = clone && clone.reportTypeId;
                if (!(type || reportTypeId)) {
                    clone.title = `Duplicado ${clone.title}`;
                }
                clone.stateId = this.DRAFT_KEY;
                clone.trash = false;
                delete clone.id;
                delete clone.section;
                delete clone.state;
                delete clone.user;
                delete clone.ownerId;

                this.saveReport(clone);
            });
    }

    public onDeleteReport(pos: number) {
        const isOutTrash = (!this.icurrentObj.deletedFg);
        const type = this.list.reports[pos] && this.list.reports[pos].type;
        const reportTypeId = this.list.reports[pos] && this.list.reports[pos].reportTypeId;
        const dialogTitle = isOutTrash
            ? `¿Está seguro de enviar el ${type || reportTypeId ? 'reporte' : 'contenido'} a la papelera?`
            : `¿Está seguro de eliminar definitivamente el ${type || reportTypeId ? 'reporte' : 'contenido'}?`;
        const id = this.list.reports[pos].id;
        const name = this.list.reports[pos].name;
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: dialogTitle,
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                if (isOutTrash) {    // Move to trash
                    this.http.patch({
                        path: `${type || reportTypeId ? 'reports' : 'contents'}/${id}`,
                        data: {
                            trash: true
                        }
                    }).subscribe(() => {
                        this.dialog.open(ConfirmationDialogComponent, {
                            width: '410px',
                            data: {
                                config: {
                                    title: `Ha sido eliminado exitosamente el ${type || reportTypeId ? 'reporte' : 'contenido'}:`,
                                    subtitle: name
                                }
                            }
                        });
                        this.list.reports.splice(pos, 1);
                        this.folderService.loadFolders();
                        this.folderService.loadStates();
                    });
                } else {    // Delete from database
                    this.http.delete({
                        path: `${type || reportTypeId ? 'reports' : 'contents'}/${id}`,
                    }).subscribe(() => {
                        this.dialog.open(ConfirmationDialogComponent, {
                            width: '410px',
                            data: {
                                config: {
                                    title: `Ha sido eliminado exitosamente ${type || reportTypeId ? 'reporte' : 'contenido'}:`,
                                    subtitle: name
                                }
                            }
                        });
                        this.list.reports.splice(pos, 1);
                    });
                }
            }
        });
    }

    public openPreviewDialog(report: any): void {
        if (this.isTabletVersion()) {
            return this.gotoPage(report.id);
        }

        if (this.isMobileVersion()) {
            this.changeView.emit({
                mobile: true,
                report,
            });
            return;
        }

        // Desktop
        const paramsDialog = {
            width: '99vw',
            height: '99vh',
            data: {
                reportId: report.id,
                styles: report.styles,
                content: report.content,
            }
        };
        this.dialog.open(PreviewDialogComponent, paramsDialog);
    }

    public openHighlightDialog(id) {
        if (id === '0') {
            const selecteds: Array<string> = this.getCheckboxesSelected();
            id = selecteds[0];
        }
        let found = this.list.reports.find(element => element.id === id);

        if (!found) {
            found = this.list.reviewed.find(element => element.id === id);
        }

        if (!found) {
            found = this.list.notReviewed.find(element => element.id === id);
        }

        const dialogRef = this.dialog.open(HighlightDialogComponent, {
            width: '760px',
            height: '900px',
            data: { report: found }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result.event === 'save') {
                setTimeout(() => {
                    this.openConfirmation();
                    this.updateReports();
                }, 200);
            }
        });
    }

    public canHighlightReport(): boolean {
        if (this.getCheckboxesSelected().length !== 1) {
            return false;
        }
        if (this.icurrentObj.currentState === '5e068c81d811c55eb40d14d0') {
            return true;
        }
        const reportOnly = this.list.reports.filter(
            (a) => a.id == this.getCheckboxesSelected()[0] && a.stateId == '5e068c81d811c55eb40d14d0'
        );
        return reportOnly.length ? true : false;
    }

    public showOptionMenu(state): boolean {
        return state === '5e068c81d811c55eb40d14d0';
    }

    public isHighlighted(id): boolean {
        const found = this.list.reports.find(element => element.id === id);
        return found.stateId === '5e068c81d811c55eb40d14d0' && found.outstanding;
    }

    public openConfirmation(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'El informe se ha destacado exitosamente',
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
        });
    }

    public updateReports() {
        this.loadReports(this.ifilter);
    }
    public isFilteringByState(): boolean {
        return this.icurrentObj.currentState;
    }

    public isShowingReviewedFilter() {
        return !this.isFilteringByState() ||
            (this.getCheckboxesSelected().length > 0 && this.isFilteringByState());
    }

    public isShowingReviewedList() {
        return this.list.reviewed.length && !this.isFiltered && !this.isFilteringByState();
    }

    public checkElement(event): void {
        const action = event.checked ? 'add' : 'remove';
        const parentElement = event.source._elementRef.nativeElement.parentNode;
        parentElement.classList[action]('checked');
    }

    public openTagDialog(categoryId: string): void {
        this.dialog.open(TagsDialogComponent, {
            width: '602px',
            data: {
                categoryId
            }
        });
    }

    public openWordsDialog(): void {
        this.dialog.open(AddWordsDialogComponent, {
            width: '602px',
            data: {
            }
        });
    }
}

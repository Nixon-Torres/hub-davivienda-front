import {Component, OnInit, AfterViewInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';

import * as qs from 'qs';

import {HttpService} from '../../../../services/http.service';
import {AuthService} from '../../../../services/auth.service';
import {loopback} from '../../../../models/common/loopback.model';

@Component({
    selector: 'app-create-report-dialog',
    templateUrl: './create-report-dialog.component.html',
    styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit, AfterViewInit {
    public createReportForm: FormGroup;
    public STORAGE_URL = environment.STORAGE_FILES;
    readonly DRAFT_KEY: string = environment.DRAFT_KEY;

    constructor(
        public dialogRef: MatDialogRef<CreateReportDialogComponent>,
        private http: HttpService,
        private auth: AuthService,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.user = this.auth.getUserData();
    }

    public authors = [];
    public selectedAuthor: any = '';
    public currentTab = 0;
    public user: any = {};
    public originalUsers = [];

    public typeSelected;
    public typeObjSelected;
    public categorySelected;
    public newSectionSelected;
    public newSubSectionSelected;
    public companySelected;
    public newSectionName;
    private newReportObj = {id: 'add-new-section', description: 'Agregar nuevo tipo de informe'};
    private newSectionAnalysisObj = {id: 'add-new-company-analysis', name: 'Análisis compañía', types: []};
    public sectionsList;

    public list: any = {
        sections: [],
        companies: [],
        categories: [],
        reportTypes: [],
        typeSections: [this.newReportObj],
        authors: this.authors,
        templates: [],
        users: [],
        reports: [],
        authorsId: []
    };

    ngOnInit() {
        this.loadSections();
        this.loadCategories();
        this.loadCompanies();
        this.loadUsers();
        this.loadTemplates();
        this.initCreteReportForm();
    }

    onNoClick(): boolean {
        this.dialogRef.close();
        return false;
    }

    ngAfterViewInit() {
        this.createReportForm.patchValue({
            folderId: this.data.folderId,
            stateId: this.data.stateId
        });
        this.loadReports();
    }

    private loadReports(): void {
        const query = new loopback();
        query.filter.where.ownerId = this.auth.getUserData('id');
        query.filter.where.trash = false;
        query.filter.where.reviewed = true;
        query.filter.limit = 6;
        query.filter.order = 'id DESC';
        this.http.get({
            path: `reports?${qs.stringify(query, {skipNulls: true})}`
        }).subscribe((response: any) => {
            this.list.reports = response.body;
        });
    }

    public initCreteReportForm(): void {
        this.createReportForm = new FormGroup({
            sectionId: new FormControl('', Validators.required),
            typeSelected: new FormControl('', Validators.required),
            templateId: new FormControl('', Validators.required),
            reportType: new FormControl(false),
            sectionTypeKey: new FormControl(false),
            stateId: new FormControl(false),
            folderId: new FormControl(false),
            reportId: new FormControl(false),
            authorsId: new FormControl(false)
        });
    }

    get f() {
        return this.createReportForm.controls;
    }

    private loadSections() {
        this.http.get({
            path: 'sections',
            data: {
                include: [
                    {
                        relation: 'reportsType',
                        scope: {
                            include: 'mainCategory'
                        }
                    }
                    ],
                order: 'priority DESC'
            },
            encode: true
        }).subscribe((response) => {
            this.list.sections = response.body;
            this.sectionsList = this.list.sections.map((e) => Object.assign({}, e));
            this.sectionsList.push(this.newSectionAnalysisObj);

            if (this.createReportForm.value.sectionId) {
                const section = this.list.sections.find(e => e.id === this.createReportForm.value.sectionId);
                if (section) {
                    this.updateTypeSections(section);
                }
            }
        });
    }

    private loadCategories() {
        this.http.get({
            path: 'categories',
            data: {
                where: {
                    parentId: null
                },
                include: 'children'
            },
            encode: true
        }).subscribe((response) => {
            this.list.categories = response.body;
        });
    }

    private loadCompanies() {
        this.http.get({
            path: 'companies',
            data: {
            },
            encode: true
        }).subscribe((response) => {
            this.list.companies = response.body;
        });
    }

    private loadUsers() {
        this.http.get({
            path: 'users/list'
        }).subscribe((response) => {
            this.originalUsers = response.body as unknown as any[];
            var users = this.originalUsers;

            users = users.filter((e) => this.isAuthorAddedAlready(e));
            this.list.users = users;
        });
    }

    private isAuthorAddedAlready(user: any) {
        const isnotcurrentuser = (user.id !== this.user.id);
        var authors = this.authors ? this.authors : [];
        var matches = (authors.find((j) => j.id === user.id));
        const isnotaddedalready = matches ? (matches.length !== 0) : false;
        const rsp = isnotcurrentuser && !isnotaddedalready;

        return rsp;
    }

    private loadTemplates() {
        this.http.get({
            path: 'templates'
        }).subscribe((response) => {
            this.list.templates = response.body;
        });
    }

    public typeChanged(event) {
        this.typeObjSelected = event;
        this.typeSelected = event.id;
    }

    public categoryChanged(event) {
        this.categorySelected = event;
    }

    public onUpdateTypes($event, index) {
        this.updateTypeSections(this.sectionsList[index]);
    }

    private updateTypeSections(section: any) {
        let types = section.reportsType || [];
        types = types.reduce((y, x) => {
            if (!y.find((e) => e.description === x.description)) {
                y.push(x);
            }
            return y;
        }, []);
        types.push(this.newReportObj);
        this.list.typeSections = types;
        this.createReportForm.patchValue({sectionTypeKey: null});
    }

    public onAddAuthor() {
        if (this.selectedAuthor) {
            this.list.authors.push(this.selectedAuthor);
            this.list.authorsId.push(this.selectedAuthor.id);
            this.createReportForm.patchValue({authorsId: this.list.authorsId});

            this.list.users = this.originalUsers.filter((e) => this.isAuthorAddedAlready(e));
            this.selectedAuthor = null;
        }
    }

    public onDeleteAuthor(pos) {
        this.list.authors.splice(pos, 1);
        this.list.users = this.originalUsers.filter((e) => this.isAuthorAddedAlready(e));
    }

    public onOptionsSelected(event) {
        this.selectedAuthor = event;
    }

    public tabChanged(idx) {
        this.currentTab = idx;
    }

    public onCloneReport(report: any) {
        const clone = Object.assign({}, report);
        clone.name = `Duplicado ${clone.name}`;
        clone.slug = `duplicado-${clone.slug}`;

        const newReport: any = {
            name: clone.name,
            slug: clone.slug,
            trash: false,
            content: clone.content,
            styles: clone.styles,
            templateId: clone.templateId,
            userId: clone.userId,
            stateId: this.DRAFT_KEY,
            sectionId: clone.sectionId,
            folderId: clone.folderId,
            reportTypeId: clone.reportTypeId,
            companyId: clone.companyId
        };

        this.saveReport(newReport);
    }

    private saveReport(clone: any): void {
        this.http.post({
            path: 'reports',
            data: clone
        }).subscribe(() => {
            this.dialogRef.close();
        });
    }

    public goToBoard() {
        // Clone report if its in second tab
        if (this.currentTab === 1) {
            const reportId = this.createReportForm.value.reportId;
            const report = this.list.reports.find(e => e.id === reportId);
            return this.onCloneReport(report);
        }

        if (this.typeSelected !== 'add-new-section' && this.createReportForm.valid) {
            let path = 'app/board';
            path += `/${this.createReportForm.value.stateId}`;
            path += `/${this.createReportForm.value.sectionId}`;
            path += `/${this.typeSelected}`;
            path += `/${(this.createReportForm.value.folderId)}`;
            path += `/${(this.companySelected ? this.companySelected : null)}`;
            path += `/${this.createReportForm.value.templateId ? this.createReportForm.value.templateId : null}`;
            path += `/${this.createReportForm.value.reportId}`;
            path += `/${this.createReportForm.value.authorsId ? encodeURI(JSON.stringify(this.createReportForm.value.authorsId)) : false}`;
            this.router.navigate([path]);
            this.dialogRef.close();
        }
    }

    public createNewSection(event) {
        if (event.keyCode !== 13) {
            return;
        }

        event.preventDefault();

        if (!this.createReportForm.value.sectionId) {
            return;
        }

        if (!this.newSectionSelected) {
            return;
        }

        if (this.categorySelected && this.categorySelected.children && this.categorySelected.children.length &&
            !this.newSubSectionSelected) {
            return;
        }
        if (!this.newSectionName) {
            return false;
        }

        this.http.post({
            path: `reportsType/`,
            data: {
                qty: 0,
                period: 0,
                description: this.newSectionName
            }
        }).subscribe((resp) => {
            this.http.post({
                path: `categoriesReportTypeGlue/`,
                data: {
                    mainCategoryId: this.newSectionSelected,
                    subCategoryId: this.newSubSectionSelected,
                    reportTypeId: (resp.body as any).id
                }
            }).subscribe((resp2) => {
                this.http.post({
                    path: `sectionsReportTypeGlue/`,
                    data: {
                        sectionId: this.createReportForm.value.sectionId,
                        reportTypeId: (resp.body as any).id
                    }
                }).subscribe((resp3) => {
                    this.typeSelected = null;
                    this.typeObjSelected = null;
                    this.newSectionSelected = null;
                    this.newSectionName = null;
                    this.newSubSectionSelected = null;
                    this.categorySelected = null;
                    this.loadSections();
                });
            });
        });
    }
}

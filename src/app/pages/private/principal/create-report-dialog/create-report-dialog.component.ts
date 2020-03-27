import {Component, OnInit, AfterViewInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../../environments/environment';

import * as qs from 'qs';

import {HttpService} from '../../../../services/http.service';
import {AuthService} from '../../../../services/auth.service';
import {loopback} from '../../../../models/common/loopback.model';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-create-report-dialog',
    templateUrl: './create-report-dialog.component.html',
    styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit, AfterViewInit {
    public createReportForm: FormGroup;
    public STORAGE_URL = environment.STORAGE_FILES;

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
    public user: any = {};
    public originalUsers = [];

    public typeSelected;
    public newSectionSelected;
    public newSectionCompanySelected;
    public newSectionName;
    private newReportObj = {key: 'add-new-section', value: 'Agregar nuevo tipo de informe'};
    private newSectionAnalysisObj = {id: 'add-new-company-analysis', name: 'Análisis compañía', types: []};
    public sectionsList;

    public list: any = {
        sections: [],
        typeSections: [this.newReportObj],
        authors: this.authors,
        templates: [],
        users: [],
        reports: [],
        authorsId: [],
        companies: [{id: 'company1', name: 'Compañia 1'}, {id: 'company2', name: 'Compañia 2'}]
    };

    ngOnInit() {
        this.loadSections();
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
            path: 'sections'
        }).subscribe((response) => {
            this.list.sections = response.body;
            this.sectionsList = this.list.sections.map((e) => Object.assign({}, e));
            this.sectionsList.push(this.newSectionAnalysisObj);
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
        this.typeSelected = event.key;
    }

    public onUpdateTypes($event, index) {
        let types = this.sectionsList[index].types || [];
        types = types.reduce((y, x) => {
            if (!y.find((e) => e.key === x.key)) {
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

    public goToBoard() {
        if (this.createReportForm.valid) {
            let path = 'app/board';
            path += `/${this.createReportForm.value.stateId}`;
            path += `/${this.createReportForm.value.sectionId}`;
            path += `/${this.typeSelected}`;
            path += `/${(this.createReportForm.value.folderId)}`;
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
        if (!this.newSectionSelected) {
            return;
        }

        if (this.newSectionSelected && this.newSectionSelected === 'add-new-company-analysis' &&
            !this.newSectionCompanySelected) {
            return;
        }
        if (!this.newSectionName) {
            return false;
        }

        console.log('new:', this.newSectionName);
        const section = this.sectionsList.find(e => e.id === this.newSectionSelected);
        const values = section.types;
        values.push({key: this.newSectionName, value: this.newSectionName});

        this.http.patch({
            path: `sections/${this.newSectionSelected}`,
            data: {
                types: values
            }
        }).subscribe((resp) => {
            this.typeSelected = this.newSectionSelected;
            this.newSectionSelected = null;
            this.newSectionName = null;
            this.newSectionCompanySelected = null;
            this.loadSections();
        });
    }
}

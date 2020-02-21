import {Component, OnInit, AfterViewInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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
    private newReportObj = {key: 'add-new-section', value: 'Agregar nuevo tipo de informe'};
    private newSectionAnalysisObj = {id: 'add-new-company-analysis', name: 'Análisis compañía', types: []};
    private sectionsList;

    public list: any = {
        sections: [],
        typeSections: [this.newReportObj],
        authors: this.authors,
        templates: [],
        users: [],
        reports: [],
        authorsId: [],
        companies: [{id: 'company1', name: 'Compañia 1'}, {id: 'company2', name: 'Compañia 2'}]
    }

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
        var query = new loopback();
        query.filter.where['ownerId'] = this.auth.getUserData('id');
        query.filter.where['trash'] = false;
        query.filter.where['reviewed'] = true;
        query.filter.limit = 6;
        query.filter.order = 'id DESC';
        this.http.get({
            'path': `reports?${qs.stringify(query, {skipNulls: true})}`
        }).subscribe((response: any) => {
            this.list.reports = response.body;
        });
    }

    public initCreteReportForm(): void {
        this.createReportForm = new FormGroup({
            sectionId: new FormControl('', Validators.required),
            sectionTypeKey: new FormControl('', Validators.required),
            stateId: new FormControl(false),
            folderId: new FormControl(false),
            templateId: new FormControl(false),
            reportId: new FormControl(false),
            authorsId: new FormControl(false)
        });
    }

    private loadSections() {
        this.http.get({
            'path': 'sections'
        }).subscribe((response) => {
            this.list.sections = response.body;
            this.sectionsList = this.list.sections.map((e) => Object.assign({}, e));
            this.sectionsList.push(this.newSectionAnalysisObj);
        });
    }

    private loadUsers() {
        this.http.get({
            'path': 'users/list'
        }).subscribe((response) => {
            this.originalUsers = response.body as unknown as any[];
            var users = this.originalUsers;

            users = users.filter((e) => this.isAuthorAddedAlready(e));
            this.list.users = users;
        });
    }

    private isAuthorAddedAlready(user: any)  {
        const isnotcurrentuser = (user.id !== this.user.id);
        var authors = this.authors ? this.authors : [];
        var matches = (authors.find((j) => j.id === user.id));
        const isnotaddedalready = matches ? (matches.length !== 0) : false;
        const rsp = isnotcurrentuser && !isnotaddedalready;

        return rsp;
    }

    private loadTemplates() {
        this.http.get({
            'path': 'templates'
        }).subscribe((response) => {
            this.list.templates = response.body;
        });
    }

    public typeChanged() {
        console.log(this.typeSelected);
    }

    public onUpdateTypes($event, index) {
        var types = this.sectionsList[index].types;
        types = types.reduce((y, x) => {
            if (!y.find((e) => e.key === x.key)) y.push(x);
            return y;
        }, []);
        types.push(this.newReportObj);
        this.list.typeSections = types;
        this.createReportForm.patchValue({'sectionTypeKey': null});
    }

    public onAddAuthor() {
        if (this.selectedAuthor) {
            this.list.authors.push(this.selectedAuthor);
            this.list.authorsId.push(this.selectedAuthor.id);
            this.createReportForm.patchValue({'authorsId': this.list.authorsId});

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
        let path = 'app/board';
        path += `/${this.createReportForm.value.stateId}`;
        path += `/${this.createReportForm.value.sectionId}`;
        path += `/${this.createReportForm.value.sectionTypeKey}`;
        path += `/${(this.createReportForm.value.folderId)}`;
        path += `/${this.createReportForm.value.templateId ? this.createReportForm.value.templateId : null}`;
        path += `/${this.createReportForm.value.reportId}`;
        path += `/${this.createReportForm.value.authorsId ? encodeURI(JSON.stringify(this.createReportForm.value.authorsId)) : false}`;
        this.router.navigate([path]);
    }

}

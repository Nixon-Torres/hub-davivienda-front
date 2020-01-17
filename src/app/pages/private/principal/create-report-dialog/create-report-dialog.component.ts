import { NgModule, Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import * as qs from 'qs';

import { HttpService } from '../../../../services/http.service';
import { AuthService } from '../../../../services/auth.service';
import { loopback } from '../../../../models/common/loopback.model';

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
    ) { }

    public authors = [];
    public selectedAuthor: string = '';

    public list: any = {
        sections: [],
        typeSections: [],
        authors: this.authors,
        templates: [],
        users: [],
        reports: []
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
            'folderId': this.data.folderId,
            'stateId': this.data.stateId
        });
        this.loadReports();
    }

    private loadReports(): void {
        var query = new loopback();
        query.filter.where['userId'] = this.auth.getUserData('id');
        query.filter.where['trash'] = false;
        query.filter.where['reviewed'] = true;
        query.filter.limit = 6;
        query.filter.order = 'id DESC';
        this.http.get({
            'path': `reports?${qs.stringify(query, { skipNulls: true })}`
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
            reportId: new FormControl(false)
        });
    }

    private loadSections() {
        this.http.get({
            'path': 'sections'
        }).subscribe((response) => {
            this.list.sections = response.body;
        });
    }

    private loadUsers() {
        this.http.get({
            'path': 'users/list'
        }).subscribe((response) => {
            this.list.users = response.body;
        });
    }

    private loadTemplates() {
        this.http.get({
            'path': 'templates'
        }).subscribe((response) => {
            this.list.templates = response.body;
        });
    }

    public onUpdateTypes($event, index) {
        this.list.typeSections = this.list.sections[index].types;
        this.createReportForm.patchValue({ 'sectionTypeKey': null });
    }

    public onAddAuthor() {
        if (this.selectedAuthor)
            this.list.authors.push(this.list.users[this.selectedAuthor]);
    }

    public onDeleteAuthor(pos) {
        if (this.selectedAuthor)
            this.list.authors.splice(pos, 1);

    }

    public onOptionsSelected() {
        this.selectedAuthor;
    }

    public goToBoard() {
        let path = 'app/board';
        path += `/${this.createReportForm.value.stateId}`;
        path += `/${this.createReportForm.value.sectionId}`;
        path += `/${this.createReportForm.value.sectionTypeKey}`;
        path += `/${(this.createReportForm.value.folderId)}`;
        path += `/${this.createReportForm.value.templateId}`;
        path += `/${this.createReportForm.value.reportId}`;
        this.router.navigate([path]);
    }

}

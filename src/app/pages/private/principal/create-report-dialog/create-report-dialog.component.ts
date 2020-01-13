import { NgModule, Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { HttpService } from '../../../../services/http.service';

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
        users: []
    }

    ngOnInit() {
        this.loadSections();
        this.loadUsers();
        this.loadTemplates();
        this.initCreteReportForm();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngAfterViewInit() {
        this.createReportForm.patchValue({
            'folderId': this.data.folderId,
            'stateId': this.data.stateId
        });
    }

    public initCreteReportForm(): void {
        this.createReportForm = new FormGroup({
            sectionId: new FormControl('', Validators.required),
            sectionTypeKey: new FormControl('', Validators.required),
            stateId: new FormControl(false),
            folderId: new FormControl(false),
            templateId: new FormControl(false)
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
            'path': 'users'
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

    public onOptionsSelected($event) {
        this.selectedAuthor;
    }

    public goToBoard() {
        let path = 'app/board';
        path += `/${this.createReportForm.value.stateId}`;
        path += `/${this.createReportForm.value.sectionId}`;
        path += `/${this.createReportForm.value.sectionTypeKey}`;
        path += `/${(this.createReportForm.value.folderId)}`;
        path += `/${this.createReportForm.value.templateId}`;
        this.router.navigate([path]);
    }

}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';
import { Grapes } from "./grapes/grape.config";

import { HttpService } from '../../../services/http.service';

import * as M from "materialize-css/dist/js/materialize";

declare var grapesjs: any;

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: [
        'board.component.scss'
    ]
})

export class BoardComponent implements OnInit, AfterViewInit {
    public editor: any = null;
    public grapes: any = null;
    public report: any = {
        "name": "",
        "slug": "",
        "trash": false,
        "styles": "",
        "content": "",
        "sectionTypeKey": "informe-nuevo",
        "templateId": "0",
        "userId": "5e024912b8287319151c688a",
        "stateId": "5e024bcab8287319151c6897",
        "sectionId": "5e024cc7b8287319151c6898",
        "folderId": "5e024997b8287319151c688c"
    };

    constructor(
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService
    ) {
        this.grapes = new Grapes({
            selectorManager: '.styles-container',
            blockManager: '.blocks-container',
            styleManager: '.styles-container'
        });
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params: any) => {
            if (params.get("id")) {
                this.report.id = params.get("id");
                this.loadReport(this.report.id);
            }
        });
    }

    ngAfterViewInit() {
        if (!this.report.id) {
            this.initGrapes();
        }

        // Load Materialize tabs function after the grapes library has loaded
        M.Tabs.init(document.querySelectorAll('.tabs'));
    }

    openPreviewDialog(): void {
        const dialogRef = this.dialog.open(PreviewDialogComponent, {
            width: '1500px'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            console.log('The dialog was closed', result);
        });
    }


    private initGrapes(): void {
        this.grapes.activeBlocks([
            'Description', 'Image', 'Title'
        ]);

        this.grapes.activeSectors([
            'Dimensions',
            'Extras'
        ]);

        this.editor = grapesjs.init(this.grapes.get('config'));
        this.editor.getWrapper().append(`<style type="text/css">` + this.report.styles +`</style>`);
    }

    public loadReport(idReport: string): void {
        this.http.get({
            'path': 'reports/' + idReport
        }).subscribe((response: any) => {

            response.body.styles = `
                section {
                    margin: 10px 40px;
                    font-family: Helvetica;
                }

                .box {
                    color: white;
                    padding: 20px 40px;
                    font-family: Helvetica;
                    background-color: black;
                }
            `;

            this.report.id = response.body.id;
            this.report.name = response.body.name;
            this.report.slug = response.body.slug;
            this.report.trash = response.body.trash;
            this.report.styles = response.body.styles;
            this.report.content = response.body.content;
            this.report.sectionTypeKey = response.body.sectionTypeKey;
            this.report.templateId = response.body.templateId;
            this.report.userId = response.body.userId;
            this.report.stateId = response.body.stateId;
            this.report.sectionId = response.body.sectionId;
            this.report.folderId = response.body.folderId;

            setTimeout(() => {
                this.initGrapes();
            }, 0);
        });
    }

    public onSave(): void {
        this.report.slug = `/${this.report.name.toLocaleLowerCase().replace(/(\s)/g, '-')}`;
        this.report.styles = this.editor.getCss();
        this.report.content = this.editor.getHtml();

        if (this.report.id) {
            this.http.put({
                'path': 'reports/'+this.report.id,
                'data': this.report
            }).subscribe((response) => {
                this.gotoPage();
            });
        } else {
            this.http.post({
                'path': 'reports',
                'data': this.report
            }).subscribe((response) => {
                this.gotoPage();
            });
        }
    }

    private gotoPage() {
        this.router.navigate(['app/principal']);
    }
}

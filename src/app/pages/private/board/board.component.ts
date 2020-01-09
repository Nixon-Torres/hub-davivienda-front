import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Report } from './board.model';
import { HttpService } from '../../../services/http.service';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';

import { Grapes } from "./grapes/grape.config";

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
    private timer: any = {
        change: null
    };
    public editor: any;
    public grapes: any;
    public report: Report = {
        name: null,
        slug: null,
        trash: false,
        styles: null,
        content: null,
        sectionTypeKey: null,
        userId: null,
        stateId: null,
        sectionId: null
    };

    constructor(
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params: any) => {
            if (params.get("id")) {
                this.report.id = params.get("id");
                this.loadReport(this.report.id);
            } else if (params.get("stateId")) {
                let folderId = params.get('folderId');
                let templateId = params.get('templateId');
                this.report.stateId = params.get('stateId');
                this.report.sectionId = params.get('sectionId');
                this.report.sectionTypeKey = params.get('sectionTypeKey');
                this.report.folderId = folderId ? folderId : null;
                this.report.templateId = templateId ? templateId : null;
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

    private initGrapes(): void {
        this.grapes = new Grapes({
            selectorManager: '.styles-container',
            blockManager: '.blocks-container',
            styleManager: '.styles-container'
        });

        this.activeBlocks();
        this.activeSectors();
        this.loadEditor();
        this.addStyles(this.report.styles);
        // this.();
    }

    // private eventsEditor(): void {
    //     // this.editor.on('loaded', () => {
    //     //     this.editor.on('change:changesCount', () => { // change:changesCount || update
    //     //         if (this.timer.change) {
    //     //             clearTimeout(this.timer.change);
    //     //         }
    //     //         this.timer.change = setTimeout(() => {
    //     //             // this.onSave(true);
    //     //         }, 2000);
    //     //     });
    //     // });
    // }

    private loadEditor(): void {
        this.editor = grapesjs.init(
            this.grapes.get('config')
        );
    }

    private activeBlocks(): void {
        this.grapes.activeBlocks([
            'Description', 'Image', 'Title'
        ]);
    }

    private activeSectors(): void {
        this.grapes.activeSectors([
            'Dimensions',
            'Extras'
        ]);

    }

    private addStyles(styles: string): void {
        this.editor.getWrapper().append(
            `<style type="text/css">${styles}</style>`
        );
    }

    private loadReport(idReport: string): void {
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

    private gotoPage() {
        this.router.navigate(['app/principal']);
    }

    public onSave(autoSave = false): void {

        this.report.slug = `/${this.report.name.toLocaleLowerCase().replace(/(\s)/g, '-')}`;
        this.report.styles = this.editor.getCss();
        this.report.content = this.editor.getHtml();

        if (this.report.id) {

            this.http.put({
                'path': 'reports/' + this.report.id,
                'data': this.report
            }).subscribe((response) => {
                if (autoSave) {
                    console.log("loading", response);
                    this.initGrapes();
                } else {
                    this.gotoPage();
                }
            });

        } else {

            this.http.post({
                'path': 'reports',
                'data': this.report
            }).subscribe((response: any) => {
                if (autoSave) {
                    console.log("autoguardo");
                } else {
                    this.gotoPage();
                }
            });
        }
    }

    public openPreviewDialog(): void {

        const dialogRef = this.dialog.open(PreviewDialogComponent, {
            width: '1500px',
            data: {
                'reportId': this.report.id
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            console.log('The dialog was closed', result);
        });
    }
}

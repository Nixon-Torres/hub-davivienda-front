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
        name: '',
        slug: null,
        trash: false,
        styles: '',
        content: '',
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
        M.Tabs.init(document.querySelectorAll('.grapes-container .tabs')[0]);
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
        this.addStyles(this.report.content, this.report.styles);
    }

    private listenEventsEditor(): void {
        this.editor.on('change:changesCount', () => {
            if (this.timer.change) {
                clearTimeout(this.timer.change);
            }
            this.timer.change = setTimeout(() => {
                this.onSave(true);
            }, 5000);
        });
    }

    private loadEditor(): void {
        this.editor = grapesjs.init(
            this.grapes.get('config')
        );
        this.listenEventsEditor();
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

    private addStyles(content: string, styles: string): void {
        this.editor.getWrapper().append(
            `<style type="text/css">${styles}</style>${content}`
        );
    }

    private loadReport(idReport: string): void {
        this.http.get({
            'path': 'reports/' + idReport
        }).subscribe((response: any) => {
            response.body.folderId = response.body.folderId ? response.body.folderId : null;
            response.body.templateId = response.body.templateId ? response.body.templateId : null;
            this.report = response.body;

            setTimeout(() => {
                this.initGrapes();
            }, 0);
        });
    }

    private setPropertiesReport(): void {
        this.report.name = this.report.name.replace(/(\s)/g, '') ? this.report.name : 'Sin Nombre';
        this.report.slug = `/${this.report.name.toLocaleLowerCase().replace(/(\s)/g, '-')}`;
        this.report.styles = this.editor.getCss();
        this.report.content = this.editor.getHtml();
    }

    public onSave(autoSave?: boolean): void {
        if (autoSave && !this.report.content) return;
        let isUpdate: boolean = this.report.id ? true : false;
        let method: string = isUpdate ? 'put' : 'post';
        let path: string = isUpdate ? `reports/${this.report.id}` : 'reports';
        if (this.timer.change) {
            clearTimeout(this.timer.change);
        }

        this.setPropertiesReport();
        this.http[method]({
            'path': path,
            'data': this.report
        }).subscribe(
            (response: any) => {
                response.body.folderId = response.body.folderId ? response.body.folderId : null;
                response.body.templateId = response.body.templateId ? response.body.templateId : null;
                this.report = response.body;
                if (!autoSave) {
                    this.goToPrincipalPage();
                }
            },
            () => {
                alert('¡Oops! \n Tus datos no se almacenaron');
            }
        );
    }

    public openPreviewDialog(): void {
        this.dialog.open(PreviewDialogComponent, {
            width: '1500px',
            data: {
                'reportId': this.report.id
            }
        });
    }

    private goToPrincipalPage(): void {
        this.router.navigate(['app/principal']);
    }
}

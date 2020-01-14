import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Report } from './board.model';
import { HttpService } from '../../../services/http.service';
import { PreviewDialogComponent } from './preview-dialog/preview-dialog.component';

import { Grapes } from "./grapes/grape.config";

import * as M from "materialize-css/dist/js/materialize";
import * as moment from 'moment';

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
    public lastupdate: string;
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

    constructor (
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService
    ) {}

    ngOnInit() {

        moment.locale('es'); // Set locale lang for momentJs

        this.activatedRoute.paramMap.subscribe((params: any) => {

            // Load report for edit, but if is a new report load basic data from URI
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

    /** Get report form database
    *
    * @param { idReport } Id for get the report
    * @return { this.report } Obj with the report data
    */
    private loadReport(idReport: string): void {
        this.http.get({
            'path': `reports/${idReport}`
        }).subscribe((response: any) => {
            response.body.folderId = response.body.folderId ? response.body.folderId : null;
            response.body.templateId = response.body.templateId ? response.body.templateId : null;
            this.report = response.body;

            this.setLastUpdate(response.body.updatedAt);

            setTimeout(() => {
                this.initGrapes();
            }, 0);
        });
    }

   /** Set content dynamically for the report last update
    *
    * @param { lastupdate } Value for the last update from database
    * @return { this.lastupdate } Time ago since last update
    */
    public setLastUpdate(lastupdate) {

        this.lastupdate = moment(lastupdate).fromNow();

        if (this.timer.lastupdate) clearInterval(this.timer.lastupdate);

        this.timer.lastupdate = setInterval(() => {
            this.lastupdate = moment(lastupdate).fromNow();
        }, 30000);
    }

    /** Start to load default data config
    *
    * @return { this.editor } Object grapes editor
    */
    private initGrapes(): void {
        this.grapes = new Grapes({
            selectorManager: '.styles-container',
            blockManager: '.blocks-container',
            styleManager: '.styles-container'
        });

        this.activeBlocks();
        this.activeSectors();
        this.loadEditor();
        this.addReportContent(this.report.content, this.report.styles);
    }

    // HTML blocks that will be displayed
    private activeBlocks(): void {
        this.grapes.activeBlocks([
            'Description',
            'Image',
            'Title'
        ]);
    }

    // Styles sectors that will be displayed
    private activeSectors(): void {
        this.grapes.activeSectors([
            'Dimensions',
            'Extras'
        ]);
    }

    // Initialize the grapes editor
    private loadEditor(): void {
        this.editor = grapesjs.init(
            this.grapes.get('config')
        );
        this.listenEventsEditor();
    }

    // Editor events listener
    private listenEventsEditor(): void {
        this.editor.on('loaded', () => {
            this.editor.on('change:changesCount', () => {
                if (this.timer.change) {
                    clearTimeout(this.timer.change);
                }
                this.timer.change = setTimeout(() => {
                    this.onSave(true);
                }, 5000);
            });
        });
    }

    /** Set report styles on grapes editor
    *
    * @param { content } String with the report HTML
    * @param { styles } String with the report CSS rules
    */
    private addReportContent(content: string, styles: string): void {
        this.editor.getWrapper().append(
            `<style type="text/css">${styles}</style>${content}`
        );
    }

    ngAfterViewInit() {
        if (!this.report.id) this.loadTemplate(this.report.templateId); // If is a new report, load data template
        M.Tabs.init(document.querySelectorAll('.grapes-container .tabs')[0]); // Initialize the tabs materialize function
    }

    /** Load a template for report if exist template ID else load an empty report
    *
    * @param { templateId } Id for load template
    * @return { this.report } Set the HTML content and CSS for template
    */
    private loadTemplate(templateId: string): void {
        if (!templateId) {
            this.initGrapes();
            return;
        }

        this.http.get({
            'path': `templates/${templateId}`
        }).subscribe((response: any) => {
            this.report.content = response.body.content ? response.body.content : '';
            this.report.styles = response.body.styles ? response.body.styles : '';

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

    /** Save the report on DB
    *
    * @param { autoSave } Flag for autosave
    */
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

                if (!autoSave) {
                    this.goToPrincipalPage();
                } else {
                    response.body.folderId = response.body.folderId ? response.body.folderId : null;
                    response.body.templateId = response.body.templateId ? response.body.templateId : null;
                    this.report = response.body;
                    console.log(this.report);
                    this.setLastUpdate(response.body.updatedAt);
                }
            },
            () => {
                alert('¡Oops! \n Tus datos no se almacenaron');
            }
        );
    }

    public openPreviewDialog(): void {
        this.dialog.open(PreviewDialogComponent, {
            width: '80vw',
            height: '80vh',
            data: {
                'reportId': this.report.id
            }
        });
    }

    private goToPrincipalPage(): void {
        this.router.navigate(['app/principal']);
    }
}

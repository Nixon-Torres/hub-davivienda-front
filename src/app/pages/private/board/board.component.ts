import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { loopback } from '../../../models/common/loopback.model';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { PreviewDialogComponent } from '../preview-dialog/preview-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { Grapes } from "./grapes/grape.config";

import * as M from "materialize-css/dist/js/materialize";
import * as moment from 'moment';
import * as qs from 'qs';

import { Report } from './board.model';
import {CreateReportDialogComponent} from '../principal/create-report-dialog/create-report-dialog.component';
import { RevisionModalComponent } from './revision-modal/revision-modal.component';

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
    public users:any = [];
    public fromReportId: string = null;
    public user: any = {};
    public editor: any;
    public grapes: any;
    public lastupdate: string;
    public grid: any = {
        col: {
            builder: 9,
            comments: 0,
            panel: 2
        },
        row: {
            builder: 1,
            comments: 1,
            panel: 1
        }
    }
    public report: Report = {
        id: null,
        name: '',
        slug: null,
        trash: false,
        reviewed: true,
        styles: '',
        content: '',
        sectionTypeKey: null,
        userId: null,
        stateId: null,
        folderId: null,
        sectionId: null
    };

    constructor(
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService,
        private auth: AuthService
    ) {
        this.user = this.auth.getUserData();
    }

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
                this.fromReportId = params.get('reportId');
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

        var query = new loopback();

        query.filter.include.push({
            relation: "state",
            scope: {
                fields: ['name']
            }
        });

        query.filter.include.push({
            relation: "events",
            scope: {
                include: {
                    relation: 'owner',
                    scope: {
                        fields: ['name']
                    }
                },
                limit: 1,
                order: "id DESC"
            }
        });

        this.http.get({
            'path': `reports/${idReport}`,
            'data': query.filter,
            'encode': true
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
        this.editor.on('load', () => {
            this.editor.on('change:changesCount', () => {
                if (this.timer.change) {
                    clearTimeout(this.timer.change);
                }
                this.timer.change = setTimeout(() => {
                    // this.onSave(true);
                }, 3000);
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
        if (templateId.toString() == 'false' && this.fromReportId.toString() == 'false') {
            this.initGrapes();
            return;
        }

        let path = templateId ? `templates/${templateId}` : `reports/${this.fromReportId}`;
        this.http.get({
            'path': path
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
        this.report.content = this.report.content ? this.report.content : ' ';
        this.report.folderId = this.report.folderId === 'false' ? null : this.report.folderId;
        this.report.templateId = this.report.templateId === 'false' ? null : this.report.templateId;
    }

    public sendBacktoReview() {
        this.report.reviewed = false;
        this.report.stateId = '5e068d1cb81d1c5f29b62975';
        this.onSave(false, () =>  {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido enviado a revisión con ajustes:',
                    subtitle: this.report.name
                }
            });
        });
    }

    public getReviewers(reviewers: Array<object>) {
        return reviewers.map((reviewer) => {
            return {reportId: this.report.id, reviewerId: reviewer['id']};
        });
    }

    public sendReview(reviewers: Array<object>) {
        this.http.post({
            'path': 'reports/reviewers',
            'data': {
                reportId: this.report.id,
                reviewers: this.getReviewers(reviewers)
            }
        }).subscribe( (resp) => {
            if(resp) {
                this.dialog.open(ConfirmationDialogComponent, {
                    width: '410px',
                    data: {
                        title: 'Tu informe ha sido enviado a revisión:',
                        subtitle: this.report.name
                    }
                });
            }
        })
    }

    public approve() {
        this.report.reviewed = true;
        this.report.stateId = '5e068d1cb81d1c5f29b62974';
        this.onSave(false, () =>  {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido aprobado:',
                    subtitle: this.report.name
                }
            });
            document.getElementById("gjs").innerHTML = '';
            this.loadReport(this.report.id);
        });
    }

    public publish() {
        this.report.reviewed = true;
        this.report.stateId = '5e068c81d811c55eb40d14d0';
        this.onSave(false, () =>  {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido publicado:',
                    subtitle: this.report.name
                }
            });
        });
    }

    /** Save the report on DB
    *
    * @param { autoSave } Flag for autosave
    */
    public onSave(autoSave?: boolean, cb?: any): void {
        let isUpdate: boolean = this.report.id ? true : false;
        let method: string = isUpdate ? 'put' : 'post';
        let path: string = isUpdate ? `reports/${this.report.id}` : 'reports';
        if (this.timer.change) {
            clearTimeout(this.timer.change);
        }

        this.setPropertiesReport();

        let data = Object.assign({}, this.report);
        delete data.state;

        this.http[method]({
            'path': path,
            'data': data
        }).subscribe(
            (response: any) => {
                if (!autoSave) {

                    if (cb) return cb();
                    let dgRef = this.dialog.open(ConfirmationDialogComponent, {
                        width: '410px',
                        data: {
                            title: 'Tu informe ha sido guardado:',
                            subtitle: this.report.name
                        }
                    });

                    dgRef.afterClosed().subscribe(() => {
                        if (!this.report.id) {
                            this.router.navigate(['app/board', response.body.id]);
                        }
                    });
                } else {
                    if (!this.report.id) {
                        this.router.navigate(['app/board', response.body.id]);
                    } else {
                        this.report.id = response.body.id;
                        response.body.folderId = response.body.folderId ? response.body.folderId : null;
                        response.body.templateId = response.body.templateId ? response.body.templateId : null;
                        // this.report = response.body;
                        this.setLastUpdate(response.body.updatedAt);
                    }
                }
            },
            () => {
                alert('¡Oops! \n Tus datos no se almacenaron');
            }
        );
    }

    public openPreviewDialog(): void {
        var paramsDialog = {
            width: '80vw',
            height: '80vh',
            data: {
                'reportId': this.report.id,
                'styles': '',
                'content': ''
            }
        };

        // If the change timer is active
        if (this.timer.change) {
            clearTimeout(this.timer.change); // Stop the timer
            // this.onSave(true); // Save the report with autoload true
        } else {
            this.setPropertiesReport();
            paramsDialog.data.styles = this.report.styles;
            paramsDialog.data.content = this.report.content;
        }

        this.dialog.open(PreviewDialogComponent, paramsDialog);
    }

    public discard() {
        let data: object = {
            'trash': true
        };

        this.http.patch({
            'path': `reports/${this.report.id}`,
            'data': data
        }).subscribe(
            (response: any) => {
                this.goToPrincipalPage();
            },
            () => {
                alert('Oops!!! \nNo actualizamos tus datos. Intenta más tarde');
            }
        );
    }

    private goToPrincipalPage(): void {
        this.router.navigate(['app/principal']);
    }

    canPublish(): boolean {
        var role = this.user.roles.find(e => (e === 'Admin'));
        return role && role.length && this.report && this.report.state && this.report.state.name === 'Aprobados sin publicar'
    }

    canApprove(): boolean {
        var role = this.user.roles.find(e => (e === 'Admin'));
        return role && role.length && this.report && this.report.state && this.report.state.name !== 'Aprobados sin publicar' &&
            this.report.state.name !== 'Publicados';
    }

    canSendToRevision(): boolean {
        var role = this.user.roles.find(e => (e === 'analyst'));
        return role && role.length && this.report && this.report.state && this.report.state.name === 'Borradores';
    }

    canSendBackToRevision(): boolean {
        var role = this.user.roles.find(e => (e === 'Admin'));
        return role && role.length && this.report && this.report.state && (this.report.state.name === 'Aprobados sin publicar' ||
            this.report.state.name === 'En revisión');
    }

    onSendToRevisionAction(): void {
        this.http.get({
            'path': 'users',
            'data': {
                'where': {
                    'roles': 'Admin'
                }
            },
            'encode': true
        }).subscribe( (resp) => {
            console.log(resp);
            this.users = resp.body;
            let dialogRef = this.dialog.open(RevisionModalComponent, {
                width: '450px',
                data: {
                    title: '¿Quien quiere que revise su informe?',
                    users: this.users
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if(result) {
                    this.sendReview(result);
                }
            });
        });
    }

    showComments() {
        this.grid.col.builder = 7;
        this.grid.col.comments = 2;
        this.grid.col.panel = 2;
        document.querySelector('mat-grid-tile.comments').classList.add('show');
    }

    hideComments() {
        document.querySelector('mat-grid-tile.comments').classList.remove('show');

        setTimeout(() => {
            this.grid.col.builder = 9;
            this.grid.col.comments = 0;
            this.grid.col.panel = 2;
        }, 100);
    }
}

import {Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

import {loopback} from '../../../models/common/loopback.model';
import {HttpService} from '../../../services/http.service';
import {AuthService} from '../../../services/auth.service';
import {PreviewDialogComponent} from '../preview-dialog/preview-dialog.component';
import {ConfirmationDialogComponent} from './confirmation-dialog/confirmation-dialog.component';
import {PdfUploadComponent} from './pdf-upload/pdf-upload.component';
import {Grapes} from './grapes/grape.config';
import {CodeMirror} from './grapes/code-mirror.config';

import * as M from 'materialize-css/dist/js/materialize';
import * as $ from 'jquery/dist/jquery';
import * as moment from 'moment';
import * as countdown from 'grapesjs-component-countdown/dist/grapesjs-component-countdown.min.js';
import * as tabs from 'grapesjs-tabs/dist/grapesjs-tabs.min.js';
import * as slider from 'grapesjs-lory-slider/dist/grapesjs-lory-slider.min.js';
import * as customCode from 'grapesjs-custom-code/dist/grapesjs-custom-code.min.js';

import {Report} from './board.model';
import {RevisionModalComponent} from './revision-modal/revision-modal.component';
import {CreateReportDialogComponent} from '../principal/create-report-dialog/create-report-dialog.component';
import {UserInterface} from 'src/app/services/auth.service.model';

declare var grapesjs: any;

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: [
        'board.component.scss'
    ]
})

export class BoardComponent implements OnInit, AfterViewInit {

    public owner: any;
    public editor: any;
    public grapes: any;
    public user: any = {};
    public users: any = [];
    public files: Array<any>;
    public lastupdate: string;
    public maxAuthors: boolean;
    public templateType: string;
    public editorsList: Array<any>;
    public editorInitiated = false;
    public isOwner: boolean = false;
    public isAdding: boolean = false;
    public isDeleting: boolean = false;
    public fromReportId: string = null;
    public showAsMobile: boolean = false;
    public isFullscreen: boolean = false;
    public isAdvancedUser: boolean = false;
    public list: any = {
        users: [],
        authors: []
    };
    public flags: any = {
        authorsList: false,
        usersList: false,
        editorsList: false
    };
    public grid: any = {
        col: {
            builder: 10,
            comments: 0,
            panel: 2
        },
        row: {
            builder: 1,
            comments: 1,
            panel: 1
        }
    };
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
        sectionId: null,
        ownerId: null,
        users: [],
    };

    private authorsId: Array<string> = [];
    private timer: any = {
        change: null
    };
    private states: any = {
        draft: '5e068d1cb81d1c5f29b62977',
        toReview: '5e068d1cb81d1c5f29b62976',
        toCorrect: '5e068d1cb81d1c5f29b62975',
        approved: '5e068d1cb81d1c5f29b62974',
        published: '5e068c81d811c55eb40d14d0'
    };

    @ViewChild('authorsParent', {static: false}) authorsParent?: ElementRef;
    @ViewChild('editorsParent', {static: false}) editorsParent?: ElementRef;

    constructor(
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService,
        private auth: AuthService,
        private renderer: Renderer2
    ) {
        this.user = this.auth.getUserData();
        this.isAdvancedUser = this.user.roles.find(e => (e === 'Admin' || e === 'medium'));
        // this.closeToggleLists();
    }

    ngOnInit() {
        moment.locale('es'); // Set locale lang for momentJs

        this.activatedRoute.paramMap.subscribe((params: any) => {

            // Load report for edit, but if is a new report load basic data from URI
            if (params.get('id')) {

                this.report.id = params.get('id');
                this.loadReport(this.report.id);
                this.getEditorsList(this.report.id);
                this.onLoadAuthors(this.report.id);
                this.checkNotifications(this.report.id);

            } else if (params.get('stateId')) {
                let folderId = params.get('folderId');
                let templateId = params.get('templateId');
                let authorsId = params.get('authorsId');

                this.fromReportId = params.get('reportId');
                this.report.stateId = params.get('stateId');
                this.report.sectionId = params.get('sectionId');
                this.report.sectionTypeKey = params.get('sectionTypeKey');
                this.report.folderId = folderId ? folderId : null;
                this.report.templateId = templateId ? templateId : null;
                this.authorsId = authorsId ? JSON.parse(decodeURI(authorsId)) : null;
            }
        });

        // When fullscreen mode is closed update isFullscreen flag
        let _this = this;
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) {
                _this.isFullscreen = false;
            }
        });
    }

    ngAfterViewInit() {
        if (!this.report.id) {
            this.loadTemplate(this.report.templateId);
        } // If is a new report, load data template

        let tabsEl: Element = document.querySelectorAll('.grapes-container .tabs')[0];
        M.Tabs.init(tabsEl); // Initialize the tabs materialize function

        let elems = document.querySelectorAll('.fixed-action-btn');
        M.FloatingActionButton.init(elems, {direction: 'top', hoverEnabled: false});
    }

    /** Get report form database
     *
     * @param { idReport } Id for get the report
     * @return { this.report } Obj with the report data
     */
    private loadReport(idReport: string): void {

        let query = new loopback();

        query.filter.include.push({
            relation: 'state',
            scope: {
                fields: ['id', 'name']
            }
        }, {
            relation: 'owner',
            scope: {
                fields: ['id', 'name']
            }
        }, {
            relation: 'files',
            scope: {
                fields: ['id', 'name', 'key', 'size']
            }
        }, {
            relation: 'template',
            scope: {
                fields: ['id', 'name', 'key']
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
            this.owner = response.body.owner;
            this.setLastUpdate(response.body.updatedAt);
            this.userIsOwner();

            this.files = response.body.files;
            this.templateType = response.body.template.key;
            if (!this.editorInitiated) {
                setTimeout(() => {
                    this.initGrapes();
                    this.editorInitiated = true;
                }, 0);
            }
        });
    }

    /** Start to load default data config
     *
     * @return { this.editor } Object grapes editor
     */
    private initGrapes(): void {
        this.grapes = new Grapes({
            blockManager: '.blocks-container',
            traitManager: '.traits-container',
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
            'Text',
            'Quote',
            'Ulist',
            'Olist',
            'OneColumn',
            'TwoColumns',
            'ThreeColumns',
            // 'Link',
            'Image',
            'Video',
        ]);
    }

    /** Init plugins for new advance blocks on editor
     *
     * @return { grapesjs.plugins } Object grapes editor
     */
    private activeAdvanceBlocks() {
        grapesjs.plugins.add(
            'gjs-component-countdown',
            countdown.default(
                this.editor,
                this.grapes.get('countdownConfig')
            )
        );

        grapesjs.plugins.add(
            'grapesjs-tabs',
            tabs.default(
                this.editor
            )
        );

        grapesjs.plugins.add(
            'grapesjs-lory-slider',
            slider.default(
                this.editor
            )
        );

        grapesjs.plugins.add(
            'grapesjs-custom-code',
            customCode.default(
                this.editor,
                this.grapes.get('customCodeConfig')
            )
        );
    }

    // Styles sectors that will be displayed
    private activeSectors(): void {
        this.grapes.activeSectors([
            'Typography'
        ]);
    }

    // Initialize the grapes editor
    private loadEditor(): void {
        this.editor = grapesjs.init(
            this.grapes.get('config')
        );

        if (this.isAdvancedUser) {
            this.activeAdvanceBlocks();
        }
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
                    this.autosetEditorHeight();
                }, 3000);
            });

            setTimeout(() => {
                this.autosetEditorHeight();
            }, 2000);
        });
    }

    private autosetEditorHeight() {
        let iframe = $('.builder iframe');
        if (!iframe.length) {
            return;
        }
        let tplBody = iframe.contents()[0].body;
        iframe.contents().find('html')[0].style.overflow = 'hidden';
        tplBody.style.height = 'auto';
        let tplBodyHeight = tplBody.offsetHeight;

        iframe.css({
            'position': 'relative',
            'height': tplBodyHeight + 'px'
        });

        // FIXME https://stackoverflow.com/questions/5489946/how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-action
        tplBody.onresize = () => {
            iframe.css({
                'height': tplBody.offsetHeight + 'px'
            });
        };
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

    /** Set content dynamically for the report last update
     *
     * @param { lastupdate } Value for the last update from database
     * @return { this.lastupdate } Time ago since last update
     */
    public setLastUpdate(lastupdate) {

        this.lastupdate = moment(lastupdate).fromNow();

        if (this.timer.lastupdate) {
            clearInterval(this.timer.lastupdate);
        }

        this.timer.lastupdate = setInterval(() => {
            this.lastupdate = moment(lastupdate).fromNow();
        }, 30000);
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

        let path = templateId && templateId !== 'null' ? `templates/${templateId}` : `reports/${this.fromReportId}`;
        this.http.get({
            'path': path
        }).subscribe((response: any) => {
            this.report.content = response.body.content ? response.body.content : '';
            this.report.styles = response.body.styles ? response.body.styles : '';

            setTimeout(() => {
                this.initGrapes();
            }, 0);
        }, (err) => {
            console.log(err);
        });
    }

    /*==============================================================*\
                               BUTTONS METHODS
    /*==============================================================*/

    public canSendToRevision(): boolean {
        return this.report.stateId === this.states.draft || this.report.stateId === this.states.toCorrect;
    }

    public canReturnToEdit(): boolean {
        return this.report.stateId === this.states.toReview;
    }

    public canApprove(): boolean {
        return this.isAdvancedUser && this.report.ownerId !== this.user.id && this.report.stateId === this.states.toReview;
    }

    public canPublish(): boolean {
        return this.isAdvancedUser && this.report.ownerId !== this.user.id && this.report.stateId === this.states.approved;
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

    /** Save the report on DB
     *
     * @param { autoSave } Flag for autosave
     */
    public onSave(autoSave?: boolean, cb?: any): void {
        let isUpdate: boolean = this.report.id ? true : false;
        let method: string = isUpdate ? 'patch' : 'post';
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
                if (method == 'post' && this.authorsId && this.authorsId.length) {
                    let authorsData = this.authorsId.map((a: string) => {
                        return {'authorId': a, 'reportId': response.body.id};
                    });
                    this.http.post({
                        'path': 'reports/authors',
                        'data': {'authors': authorsData}
                    }).subscribe(() => {
                    });
                }

                if (!autoSave) {
                    if (cb) {
                        return cb();
                    }
                    let dgRef = this.dialog.open(ConfirmationDialogComponent, {
                        width: '410px',
                        data: {
                            title: 'Su informe fue guardado con éxito en',
                            subtitle: (this.report.state ? this.report.state.name : 'Borradores').toUpperCase()
                        }
                    });

                    dgRef.afterClosed().subscribe(() => {
                        if (!this.report.id) {
                            this.router.navigate(['app/board', response.body.id]);
                        }
                    });
                    this.getEditorsList(this.report.id);
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
        }).subscribe((resp: any) => {
            if (resp) {
                this.dialog.open(ConfirmationDialogComponent, {
                    width: '410px',
                    data: {
                        title: 'Tu informe ha sido enviado a revisión:',
                        subtitle: this.report.name
                    }
                });
            }
            this.report.state = resp.body.report.state;
            this.report.stateId = resp.body.report.stateId;
        });
    }

    public onSendToRevisionAction(): void {
        this.http.get({
            'path': 'users',
            'data': {
                'where': {
                    'roles': 'Admin'
                }
            },
            'encode': true
        }).subscribe((resp) => {
            this.users = resp.body;
            let dialogRef = this.dialog.open(RevisionModalComponent, {
                width: '450px',
                data: {
                    title: '¿Quien quiere que revise su informe?',
                    users: this.users
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.sendReview(result);
                }
            });
        });
    }

    public returnToEdit(): void {
        this.http.patch({
            'path': `reports/${this.report.id}`,
            'data': {
                reviewed: false,
                stateId: '5e068d1cb81d1c5f29b62975'
            }
        }).subscribe((response: any) => {
            this.report.stateId = response.body.stateId;
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido enviado a revisión con ajustes:',
                    subtitle: this.report.name
                }
            });
        });
    }

    public approve() {
        this.report.reviewed = true;
        this.report.stateId = '5e068d1cb81d1c5f29b62974';
        this.onSave(false, () => {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido aprobado:',
                    subtitle: this.report.name
                }
            });
            this.loadReport(this.report.id);
        });
    }

    public publish() {
        this.report.reviewed = true;
        this.report.stateId = '5e068c81d811c55eb40d14d0';
        this.onSave(false, () => {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    title: 'Tu informe ha sido publicado:',
                    subtitle: this.report.name
                }
            });
        });
    }

    public openUploadDialog(): void {
        let dialogRef = this.dialog.open(PdfUploadComponent, {
            width: '470px',
            data: {
                reportId: this.report.id,
                files: this.files
            }
        });
        dialogRef.afterClosed().subscribe((response: any) => {
            this.loadReport(this.report.id);
            if (response) {
                this.http.patch({
                    path: `reports/${this.report.id}`,
                    data: {
                        pdfId: response.id,
                    }
                }).subscribe(() => {

                });
            }
        });
    }

    public discard() {

        let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                title: '¿Está seguro de enviar el reporte a la papelera?',
                subtitle: '',
                alert: true
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                let data: object = {
                    'trash': true
                };

                this.http.patch({
                    'path': `reports/${this.report.id}`,
                    'data': data
                }).subscribe(
                    (response: any) => {
                        this.dialog.open(ConfirmationDialogComponent, {
                            width: '410px',
                            data: {
                                title: 'Ha sido eliminado exitosamente el informe:',
                                subtitle: this.report.name
                            }
                        });
                        this.goToPrincipalPage();
                    },
                    () => {
                        alert('Oops!!! \nNo actualizamos tus datos. Intenta más tarde');
                    }
                );
            }
        });

    }

    public getEditorClasses() {
        var classes = [];

        if (this.templateType === 'pdf' || this.templateType === 'presentation') {
            classes.push('pdf-button');
        }

        //{'pdf-button': (templateType === 'pdf' || templateType === 'presentation'), showAsMobile ? 'mobile' : 'desktop'}
        if (this.showAsMobile) {
            classes.push('mobile');
        } else {
            classes.push('desktop');
        }
        return classes;
    }

    public showComments() {
        this.grid.col.builder = 8;
        this.grid.col.comments = 2;
        this.grid.col.panel = 2;
        document.querySelector('mat-grid-tile.comments').classList.add('show');
    }

    public hideComments() {
        document.querySelector('mat-grid-tile.comments').classList.remove('show');

        setTimeout(() => {
            this.grid.col.builder = 10;
            this.grid.col.comments = 0;
            this.grid.col.panel = 2;
        }, 100);
    }

    public focusOnReportName() {
        document.getElementById('reportName').focus();
    }

    private findParent(element, parent) {
        for (let parentNode of element.path) {
            if (parentNode === parent) {
                return;
            } else {
                return true;
            }
        }
    }

    private closeToggleLists() {
        this.renderer.listen('window', 'click', (e: Event) => {
            if (this.findParent(e, this.authorsParent.nativeElement)) {
                this.flags.authorsList = false;
                this.flags.usersList = false;
            }
            if (this.findParent(e, this.editorsParent.nativeElement)) {
                this.flags.editorsList = false;
            }
            ;
        });
    }

    /** Restore BUTTON onClick
     *   Restore the template
     */
    public restoreGrapes() {
        this.editor.UndoManager.undoAll();
    }

    /** Undo BUTTON onClick
     *   Go back to the last modifications
     */
    public undoGrapes() {
        this.editor.UndoManager.undo();
    }

    /** Redo BUTTON onClick
     *   Go to the next modification
     */
    public redoGrapes() {
        this.editor.UndoManager.redo();
    }

    /** Fullscreen BUTTON onClick
     *   set flag for enter or exit fullscreen mode
     */
    public fullscreen() {

        if (this.isFullscreen) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }

        this.isFullscreen = !this.isFullscreen;
    }

    /** Responsive BUTTON onClick
     *   Change device view (desktop and mobile)
     */
    public changeDeviceView() {
        this.showAsMobile = !this.showAsMobile;
    }

    /** Import code BUTTON onClick
     *   Change template content by code
     */
    public importCode() {
        let codeMirror = new CodeMirror();
        let codeViewer = this.editor.CodeManager.getViewer('CodeMirror').clone();
        let viewerEditor = codeViewer.editor;
        let modal = this.editor.Modal;
        let grapesContent = this.editor.getHtml();
        let container = this.getModalContainer();
        let txtarea = container.children[1];
        let btn: HTMLElement = container.children[2] as HTMLElement;

        modal.setTitle('Editor de código');
        modal.setContent(container);
        codeViewer.set(codeMirror.getConfig());
        codeViewer.init(txtarea);
        codeViewer.setContent(grapesContent);
        viewerEditor = codeViewer.editor;
        btn.onclick = () => {
            this.editor.setComponents(viewerEditor.getValue().trim());
            modal.close();
        };

        modal.open();
        viewerEditor.refresh();
    }

    private getModalContainer() {
        let pfx = this.editor.getConfig('stylePrefix');
        let container = document.createElement('div');
        let labelEl = document.createElement('div');
        let txtarea = document.createElement('textarea');
        let btnImp = document.createElement('button');

        labelEl.className = `${pfx}import-label`;
        labelEl.innerHTML = 'Edite aqui su HTML/CSS y haga click en Importar';
        btnImp.type = 'button';
        btnImp.className = `btn`;
        btnImp.innerHTML = 'Importar';

        container.appendChild(labelEl);
        container.appendChild(txtarea);
        container.appendChild(btnImp);

        return container;
    }

    private getAvailableAuthors(users: Array<any>): Array<any> {
        let currentAuthors = this.list.authors.map((a: any) => a.author.id);
        return users.filter((a: any) => currentAuthors.indexOf(a.id) == -1 && this.user != a.id && this.report.id != a.id);
    }

    private onLoadUsers() {
        this.http.get({
            'path': 'users/list'
        }).subscribe((response) => {
            var users = response.body as unknown as any[];
            this.list.users = this.getAvailableAuthors(users);
        });
    }

    private onLoadAuthors(idReport) {
        this.http.get({
            'path': `reportAuthors`,
            'data': {
                include: [
                    {
                        relation: 'author',
                        scope: {
                            fields: ['id', 'name']
                        }
                    }
                ],
                where: {
                    reportId: idReport
                },
                fields: ['id', 'authorId', 'reportId']
            },
            encode: true
        }).subscribe((response: any) => {
            if (response) {
                this.list.authors = response.body;
                this.maxAuthors = this.list.authors.length >= 4 ? true : false;
                this.onLoadUsers();
            }
        });
    }

    public onDeleteAuthor(event, authorId) {
        event.stopPropagation();
        this.isDeleting = true;
        this.http.delete({
            'path': `reportAuthors/${authorId}`,
        }).subscribe((response: any) => {
            if (response) {
                this.onLoadAuthors(this.report.id);
                this.isDeleting = false;
            }
        });
    }

    public onAddAuthor(author) {
        this.isAdding = true;
        if (!this.maxAuthors) {
            this.http.post({
                'path': `reportAuthors`,
                'data': {
                    reportId: this.report.id,
                    authorId: author.id
                },
                encode: true
            }).subscribe((response: any) => {
                if (response) {
                    this.flags.usersList = false;
                    this.flags.authorsList = true;
                    this.onLoadAuthors(this.report.id);
                    this.isAdding = false;
                }
            });
        }
    }

    public toggleAuthorsList(event) {
        this.flags.authorsList = !this.flags.authorsList;
        this.flags.usersList = false;
        this.flags.editorsList = false;
        event.stopPropagation();
    }

    public toggleUsersList(event) {
        this.flags.usersList = !this.flags.usersList;
        event.stopPropagation();
    }

    public toggleEditorsList(event) {
        this.flags.editorsList = !this.flags.editorsList;
        this.flags.authorsList = false;
        this.flags.usersList = false;
        event.stopPropagation();
    }

    public getEditorsList(reportId) {
        this.http.get({
            'path': `reports/editors?reportId=${reportId}`,
        }).subscribe((response: any) => {
            this.editorsList = response.body.editors;
        });
    }

    private userIsOwner() {
        if (this.report.ownerId === this.user.id) {
            this.isOwner = true;
        }
    }

    public checkNotifications(reportId: string) {
        let dataFilter = encodeURI(JSON.stringify({reportId: reportId}));
        this.http.patch({
            'path': `notifications/read?filter=${dataFilter}`,
            'data': {'readed': true}
        }).subscribe();
    }

    private goToPrincipalPage(): void {
        this.router.navigate(['app/principal']);
    }
}

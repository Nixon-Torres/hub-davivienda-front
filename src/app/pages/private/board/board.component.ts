import {Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, ViewEncapsulation} from '@angular/core';
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
import {CreationModalComponent} from './creation-modal/creation-modal.component';

import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import {forkJoin, Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';

declare var grapesjs: any;
declare global {
    interface Window { editor: any; }
}

window.editor = window.editor || {};

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: [
        'board.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class BoardComponent implements OnInit, AfterViewInit {
    public STORAGE_URL = environment.STORAGE_FILES;

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
    public isOwner = false;
    public isAdding = false;
    public isDeleting = false;
    public fromReportId: string = null;
    public showAsMobile = false;
    public isFullscreen = false;
    public isAdvancedUser = false;
    public grapeEnabled = false;
    public addMenuVisible = false;

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

    public blocksToRemove: any = [];

    public report: Report = {
        id: null,
        name: '',
        slug: null,
        trash: false,
        reviewed: true,
        styles: '',
        content: '',
        reportTypeId: null,
        userId: null,
        stateId: null,
        folderId: null,
        companyId: null,
        sectionId: null,
        ownerId: null,
        users: [],
        tags: [],
        reportType: null,
        blocks: [],
        rTitle: null,
        rFastContent: null,
        rSmartContent: null,
        rDeepContent: null,
        template: null,
        files: null,
        rSmartContentVideo: null,
        presentationUrl: null,
        metaTitle: null,
        metaDescription: null
    };

    public tags = {
        categories: [],
        tendencies: []
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
    private templates: any = {
        html: '5e20ce2518175909bda0e824',
        pdf: '5e20ced618175909bda0e825',
        presentation: '5e20cf6f18175909bda0e826',
        twoColumns: '5e20dc5018175909bda0e827'
    };
    public isMarketing: boolean;
    public readonly = false;
    public unresolvedComments: any;
    public tendenciesList: any;

    @ViewChild('authorsParent', {static: false}) authorsParent?: ElementRef;
    @ViewChild('editorsParent', {static: false}) editorsParent?: ElementRef;

    @ViewChild('editor1', {static: false}) editor1?: ElementRef;
    @ViewChild('editor2', {static: false}) editor2?: ElementRef;
    @ViewChild('editor3', {static: false}) editor3?: ElementRef;
    @ViewChild('editor4', {static: false}) editor4?: ElementRef;
    @ViewChild('editor5', {static: false}) editor5?: ElementRef;

    private editorOptions = {
        editor1: {
            removePlugins: [ 'Link' ],
            heading: {
                options: [
                    { model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' }
                ]
            },
            initialData: '<h2></h2>'
        },
        editor3: {
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    {
                        model: 'headingFancy',
                        view: {
                            name: 'p',
                            classes: 'box-title',
                            styles: {
                                'font-weight': 'bold'
                            }
                        },
                        title: 'Heading 2',
                        class: 'ck-heading_heading2_fancy',

                        // It needs to be converted before the standard 'heading2'.
                        converterPriority: 'high'
                    }
                ]
            }
        },
        editor4: {
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    {
                        model: 'headingFancy',
                        view: {
                            name: 'h2',
                            classes: 'box-title',
                            styles: {
                                'font-weight': 'bold',
                                'margin-bottom': '5px'
                            }
                        },
                        title: 'Heading 2',
                        class: 'ck-heading_heading2_fancy',

                        // It needs to be converted before the standard 'heading2'.
                        converterPriority: 'high'
                    }
                ]
            }
        },
        blocks: {
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    {
                        model: 'headingFancy',
                        view: {
                            name: 'h2',
                            classes: 'box-title',
                            styles: {
                                'font-weight': 'bold',
                                'margin-bottom': '5px'
                            }
                        },
                        title: 'Heading 2',
                        class: 'ck-heading_heading2_fancy',

                        // It needs to be converted before the standard 'heading2'.
                        converterPriority: 'high'
                    }
                ]
            }
        },
        default: {

        }
    };

    public editor1Data = '';
    public editor2Data = '';
    public editor3Data = '';
    public editor4Data = '';
    public editor5Data = '';

    public blocks: any = [];
    public banner: any = {};
    public newBanner: any = {};

    constructor(
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private http: HttpService,
        private auth: AuthService,
        private renderer: Renderer2,
        private ref: ElementRef
    ) {
        this.user = this.auth.getUserData();
        this.isAdvancedUser = this.user.roles.find(e => (e === 'Admin' || e === 'medium'));
        this.isMarketing = this.auth.isMarketing();
        // this.closeToggleLists();
    }

    ngOnInit() {
        this.showSomeoneEditingDialog();
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
                const folderId = params.get('folderId');
                const companyId = params.get('companyId');
                const templateId = params.get('templateId');
                const authorsId = params.get('authorsId');

                this.fromReportId = params.get('reportId');
                this.report.stateId = params.get('stateId');
                this.report.sectionId = params.get('sectionId');
                this.report.reportTypeId = params.get('sectionTypeKey');
                this.report.folderId = folderId ? folderId : null;
                this.report.companyId = companyId ? companyId : null;
                this.report.templateId = templateId ? templateId : null;
                this.authorsId = authorsId ? JSON.parse(decodeURI(authorsId)) : null;
                if (!this.user.reportCreationWizardHidden) {
                    this.openCreateModal(templateId, this.user.id);
                }
            }
        });

        // When fullscreen mode is closed update isFullscreen flag
        const instance = this;
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                instance.isFullscreen = false;
            }
        });
    }

    ngAfterViewInit() {
        if (!this.report.id) {
            this.loadTemplate(this.report.templateId);
        } // If is a new report, load data template

        const tabsEl: Element = document.querySelectorAll('.grapes-container .tabs')[0];
        M.Tabs.init(tabsEl); // Initialize the tabs materialize function

        const elems = document.querySelectorAll('.fixed-action-btn');
        M.FloatingActionButton.init(elems, {direction: 'top', hoverEnabled: false});

        this.enableInlineEditor();
    }

    setDataInInlineEditor() {
        this.editor1Data = this.report.rTitle ? this.report.rTitle : '';
        this.editor2Data = this.report.rFastContent ? this.report.rFastContent : '';
        this.editor3Data = this.report.rSmartContent ? this.report.rSmartContent : '';
        this.editor4Data = this.report.rDeepContent ? this.report.rDeepContent : '';
        this.editor5Data = this.report.rPreContent ? this.report.rPreContent : '';

        const ids = ['editor1', 'editor2', 'editor3', 'editor4', 'editor5'];
        ids.forEach((elementId) => {
            if (elementId !== 'editor5' || (elementId === 'editor5' && this.report.template.key === 'html')) {
                if (this[elementId]) {
                    this[elementId].nativeElement.innerHTML = this[elementId + 'Data'];
                }
            }
        });

        setTimeout(() => {
            this.blocks.forEach((block) => {
                const element = this.ref.nativeElement.querySelector( '#' + block.id);
                if (element) {
                    element.innerHTML = block.content;
                }

                this.addInlineEditor(block.id, block.type !== 'onecolumn' ? 'Escriba cuerpo de texto' : 'CONTENT');
                block.initialized = true;
            });
        }, 500);
    }

    addInlineEditor(elementId: string, placeholder?: string) {
        const element = this.ref.nativeElement.querySelector( '#' + elementId );
        let options = this.editorOptions[elementId] || this.editorOptions.default;

        if (elementId.startsWith('r')) {
            options = this.editorOptions.blocks;
        }
        const editorOptions = options ? options : {};
        editorOptions.placeholder = placeholder;

        if (this[elementId + 'Data'] && editorOptions.initialData) {
            delete editorOptions.initialData;
        }

        InlineEditor
            .create( element, editorOptions)
            .then( editor => {
                window.editor = editor;

                editor.model.document.on( 'change:data', () => {
                    const block = this.blocks.find(e => e.id === elementId);
                    const data = editor.getData();

                    if (block) {
                        block.content = data;
                    } else {
                        this[elementId + 'Data'] = data;
                    }
                } );
            } )
            .catch( error => {
                console.error( 'There was a problem initializing the editor.', error );
            } );
    }

    enableGrapeEditor() {
        this.grapeEnabled = true;
        const instance = this;
        setTimeout(() => {
            instance.initGrapes();
        }, 2000);
    }

    enableInlineEditor() {
        this.grapeEnabled = false;

        const instance = this;
        setTimeout(() => {
            instance.addInlineEditor('editor1', 'Escriba aquí el subtitulo con el que empieza su informe');
            instance.addInlineEditor('editor2', 'Escriba aca texto destacado si es necesario (fast content)');
            instance.addInlineEditor('editor3', 'SMART CONTENT');
            instance.addInlineEditor('editor4', 'DEEP CONTENT');

            if (this.report && this.report.template && this.report.template.key === 'html') {
                instance.addInlineEditor('editor5', 'Escriba aquí el seguimientos de las acciones de las empresas');
            }
        }, 500);
    }

    showSomeoneEditingDialog() {
        if (this.readonly) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '488px',
                data: {
                    isAlert: true,
                    config: {
                        icon: 'icon-exclamation',
                        title: 'Hay otro usuario editando este informe',
                        mainButton: 'Ir al dashboard',
                        mainButtonStyle: {
                            width: '200px',
                        },
                        secondButton: 'Continuar modo lectura',
                        secondButtonStyle: {
                            width: '200px',
                            'border-width': '1px',
                            'border-color': '#0080FF',
                            color: '#0080FF'
                        }
                    }
                }
            });
            dialogRef.afterClosed().subscribe(resp => {
               if (resp) {
                    this.router.navigate(['app/principal']);
               }
            });
        }
    }

    private shouldHaveFileMessage(templateId: string): boolean {
        let fileMessage: boolean;
        if (templateId === this.templates.html || templateId === this.templates.twoColumns) {
            fileMessage = false;
        } else if (templateId === this.templates.pdf || templateId === this.templates.presentation) {
            fileMessage = true;
        }
        return fileMessage;
    }

    private openCreateModal(templateId: string, ownerId: string): void {
        let text: string;
        text = 'A continuación deberá hacer una descripción de su informe que contenga un máximo de 2000 caracteres';
        text += this.shouldHaveFileMessage(templateId) ? ' y deberá cargar su archivo al final.' : '.';

        this.dialog.open(CreationModalComponent, {
            width: '470px',
            data: {
                title: '¡Antes de empezar!',
                text,
                templateId,
                userId: ownerId
            }
        });
    }

    /** Get report form database
     *
     * @param idReport Id for get the report
     * @return report Obj with the report data
     */
    private loadReport(idReport: string): void {

        const query = new loopback();

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
        }, {
            relation: 'reportType',
            scope: {
                include: ['mainCategory', 'subCategory']
            }
        }, {
            relation: 'blocks',
            scope: {
                include: ['files']
            }
        });

        this.http.get({
            path: `reports/${idReport}`,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            response.body.folderId = response.body.folderId ? response.body.folderId : null;
            response.body.companyId = response.body.companyId ? response.body.companyId : null;
            response.body.templateId = response.body.templateId ? response.body.templateId : null;

            this.report = response.body;
            const banner = this.report.files.find(e => e.key === 'bannerImage');

            this.banner = banner ? banner : {};
            this.blocks = this.report.blocks.map(e => {
                const img = e.files && e.files.length ? e.files[0] : {};
                return {
                    ...e,
                    imageId: img.id,
                    assetUrl: img && img.fileName ? this.STORAGE_URL + img.fileName : null,
                    id: 'r' + e.id
                };
            });
            this.owner = response.body.owner;
            this.setLastUpdate(response.body.updatedAt);
            this.userIsOwner();
            this.onLoadTendenciesTags();
            this.onLoadCategoriesTags();

            this.setDataInInlineEditor();

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
     * @return editor Object grapes editor
     */
    private initGrapes(): void {
        if (!this.grapeEnabled) {
            return;
        }

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
     * @return grapesjs.plugins Object grapes editor
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
        const iframe = $('.builder iframe');
        if (!iframe.length) {
            return;
        }
        const tplBody = iframe.contents()[0].body;
        iframe.contents().find('html')[0].style.overflow = 'hidden';
        tplBody.style.height = 'auto';
        const tplBodyHeight = tplBody.offsetHeight;

        iframe.css({
            position: 'relative',
            height: tplBodyHeight + 'px'
        });

        // FIXME https://stackoverflow.com/questions/5489946/how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-action
        tplBody.onresize = () => {
            iframe.css({
                height: tplBody.offsetHeight + 'px'
            });
        };
    }

    /** Set report styles on grapes editor
     *
     * @param content string with the report HTML
     * @param styles string with the report CSS rules
     */
    private addReportContent(content: string, styles: string): void {
        this.editor.getWrapper().append(
            `<style type="text/css">${styles}</style>${content}`
        );
    }

    /** Set content dynamically for the report last update
     *
     * @param lastupdate Value for the last update from database
     * @return lastupdate Time ago since last update
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
     * @param templateId Id for load template
     * @return report Set the HTML content and CSS for template
     */
    private loadTemplate(templateId: string): void {
        if (templateId.toString() === 'false' && this.fromReportId.toString() === 'false') {
            this.initGrapes();
            return;
        }

        const path = templateId && templateId !== 'null' ? `templates/${templateId}` : `reports/${this.fromReportId}`;
        this.http.get({
            path
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
        return this.isAdvancedUser && this.report.stateId === this.states.approved;
    }

    private setPropertiesReport(): void {
        this.report.name = this.report.name.replace(/(\s)/g, '') ? this.report.name : 'Sin Nombre';
        this.report.slug = `/${this.report.name.toLocaleLowerCase().replace(/(\s)/g, '-')}`;
        this.report.styles = this.editor ? this.editor.getCss() : this.report.styles;
        this.report.content = this.editor ? this.editor.getHtml() : this.report.content;
        this.report.content = this.report.content ? this.report.content : ' ';
        this.report.folderId = this.report.folderId === 'false' ? null : this.report.folderId;
        this.report.companyId = this.report.companyId === 'false' ? null : this.report.companyId;
        this.report.templateId = this.report.templateId === 'false' ? null : this.report.templateId;
    }

    public validateMarketingOnSave(autoSave?: boolean) {
        if (this.isMarketing) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    config: {
                        twoButtons: true,
                        icon: 'icon-exclamation',
                        iconColor: '#FF003B',
                        title: 'Está seguro que desea publicar el informe:',
                        subtitle: this.report.name,
                        mainButton: 'Si, publicar',
                        secondButton: 'Cancelar'
                    }
                }
            });

            dialogRef.afterClosed().subscribe((resp: any) => {
                if (resp) {
                    this.onSave(autoSave);
                }
            });
        } else {
            this.onSave(autoSave);
        }
    }

    public validateUnresolvedComments() {
        if (this.unresolvedComments.state) {
            const refDialog = this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    isAlert: true,
                    config: {
                        icon: 'icon-exclamation',
                        title: `Tienes (${this.unresolvedComments.count}) notificaciones sin resolver`,
                        titleStyle: {
                            'font-weight': 'bold'
                        },
                        subtitle: 'Está seguro que desea publicar el informe',
                        subtitleStyle: {
                            'font-weight': 'normal',
                        },
                        mainButton: 'Resolver'
                    }
                }
            });
            refDialog.afterClosed().subscribe(() => {
                this.showComments();
            });
        } else {
            this.publishConfirmation();
        }
    }

    setDataFromForm() {
        this.report.rTitle = this.editor1Data;
        this.report.rFastContent = this.editor2Data;
        this.report.rSmartContent = this.editor3Data;
        this.report.rDeepContent = this.editor4Data;
        this.report.rPreContent = this.editor5Data;
    }

    public onSaveBlocks(): void {
        let blocksCreated;
        let blocksUpdated;
        let imagesUpserted;

        const IdstoRemove = this.blocksToRemove.map(e => e.id.substr(1));
        const blocksToCreate = this.blocks.filter(e => e.isNew).map((block) => {
            return {
                localId: block.id,
                title: block.title,
                content: block.content,
                source: block.source,
                fileName: block.fileName,
                type: block.type
            };
        });
        const blocksToUpdate = this.blocks.filter(e => e.localId).map((block) => {
            return {
                id: block.id.substr(1),
                localId: block.localId,
                title: block.title,
                content: block.content,
                source: block.source,
                fileName: block.fileName,
                type: block.type
            };
        });

        let imgsToCreate = this.blocks.filter(e => e.file && (e.isNew || (!e.isNew && !e.imageId))).map((block) => {
            return {
                isNew: block.isNew,
                id: block.isNew ? block.id : block.id.substr(1),
                localId: block.localId,
                file: block.file,
                imageId: block.imageId
            };
        });

        const imgsToRemove = this.blocks.filter(e => !e.file && e.imageId && !e.assetUrl).map(e => e.imageId);

        this.deleteBlocks(IdstoRemove).then((res) => {
            return this.createBlocks(blocksToCreate);
        }).then((res) => {
            if (res) {
                blocksCreated = res.map(e => e.body);
                imgsToCreate = imgsToCreate.map(e => {
                    if (!e.isNew) {
                        e.id = e.id.substr(1);
                        return e;
                    }

                    const blockCreated = blocksCreated.find(j => j.localId === e.id);
                    e.id = blockCreated.id;
                    return e;
                });
            }
            return this.updateBlocks(blocksToUpdate);
        }).then((res) => {
            if (res) {
                blocksUpdated = res.map(e => e.body);
            }

            return this.saveBlockImages(imgsToCreate);
        }).then((res) => {
            if (res) {
                imagesUpserted = res.map(e => e.body);
            }

            return this.deleteBlockImages(imgsToRemove);
        }).then(() => {
            if (this.report && this.report.id) {
                this.loadBlocks();
            }
        });
    }

    public loadBlocks() {
        return this.http.get({
            path: 'reports/' + this.report.id + '/blocks',
            data: {
                include: [
                    'files'
                ]
            },
            encode: true
        }).subscribe((res) => {
            const blocks = res.body as any;
            this.blocks = blocks.map(e => {
                const img = e.files && e.files.length ? e.files[0] : {};
                return {
                    ...e,
                    imageId: img.id,
                    assetUrl: img && img.fileName ? this.STORAGE_URL + img.fileName : null,
                    id: 'r' + e.id
                };
            });

            setTimeout(() => {
                this.blocks.forEach((block) => {
                    const element = this.ref.nativeElement.querySelector( '#' + block.id);
                    if (element) {
                        element.innerHTML = block.content;
                    }

                    this.addInlineEditor(block.id, block.type !== 'onecolumn' ? 'Escriba cuerpo de texto' : 'CONTENT');
                    block.initialized = true;
                });
            }, 500);
        });
    }

    public saveBlockImages(blocks): Promise<any> {
        if (blocks.length === 0) {
            return Promise.resolve(null);
        }

        const observables = blocks.map((block) => {
            return this.saveBlockImage(block);
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    private saveBannerImage() {
        if (this.banner.toDelete && !this.newBanner.imageUrl) {
            return this.http.delete({
                path: 'media/' + this.banner.id
            }).subscribe((res) => {
                this.banner = {};
            });
        }

        if (!this.newBanner.imageUrl) {
            return;
        }

        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg'])));
        formData.append('file', this.newBanner.file);
        formData.append('key', 'bannerImage');
        formData.append('resourceId', this.report.id);
        if (this.banner.id) {
            formData.append('id', this.banner.id);
        }
        return this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((res) => {
            const banner = res.body as any;
            this.banner = banner.file;
            this.newBanner = {};
        });
    }

    private saveBlockImage(block): Observable<any> {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg'])));
        formData.append('file', block.file);
        formData.append('key', 'blockImage');
        formData.append('resourceId', block.id);
        if (block.imageId) {
            formData.append('id', block.imageId);
        }
        return this.http.post({
            path: 'media/upload',
            data: formData
        });
    }

    public updateBlocks(blocks): Promise<any> {
        if (blocks.length === 0) {
            return Promise.resolve(null);
        }

        const observables = blocks.map((block) => {
            return this.http.patch({
                path: 'reportBlocks/' + block.id,
                data: block
            });
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    public createBlocks(blocks): Promise<any> {
        if (blocks.length === 0) {
            return Promise.resolve(null);
        }

        const observables = blocks.map((block) => {
            return this.http.post({
                path: 'reports/' + this.report.id + '/blocks',
                data: block
            });
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    public deleteBlockImages(ids): Promise<any> {
        if (ids.length === 0) {
            return Promise.resolve(null);
        }

        const observables = ids.map(id => {
            return this.http.delete({
                path: '/media/' + id,
            });
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    public deleteBlocks(ids): Promise<any> {
        if (ids.length === 0) {
            return Promise.resolve(null);
        }

        const observables = ids.map(id => {
            return this.http.delete({
                path: '/reportBlocks/' + id,
            });
        });

        return new Promise((res, rej) => {
            forkJoin(observables).subscribe((response) => {
                return res(response);
            }, (err) => {
                return rej(err);
            });
        });
    }

    /** Save the report on DB
     *
     * @param autoSave Flag for autosave
     * @param cb Callback
     */
    public onSave(autoSave?: boolean, cb?: any): void {
        const isUpdate: boolean = !!this.report.id;
        const method: string = isUpdate ? 'patch' : 'post';
        const path: string = isUpdate ? `reports/${this.report.id}` : 'reports';
        if (this.timer.change) {
            clearTimeout(this.timer.change);
        }

        this.setPropertiesReport();
        this.setDataFromForm();

        const data = Object.assign({}, this.report);
        delete data.state;

        this.http[method]({
            path,
            data
        }).subscribe(
            (response: any) => {
                this.onSaveBlocks();
                this.saveBannerImage();
                if (method === 'post' && this.authorsId && this.authorsId.length) {
                    const authorsData = this.authorsId.map((a: string) => {
                        return {authorId: a, reportId: response.body.id};
                    });
                    this.http.post({
                        path: 'reports/authors',
                        data: { authors: authorsData }
                    }).subscribe(() => {
                    });
                }

                if (!autoSave) {
                    if (cb) {
                        return cb();
                    }
                    const dgRef = this.dialog.open(ConfirmationDialogComponent, {
                        width: '410px',
                        data: {
                            config: {
                                title: this.isMarketing ?
                                    'Se ha publicado exitosamente el informe' : 'Su informe fue guardado con éxito en',
                                subtitle: this.isMarketing ? this.report.name :
                                    (this.report.state ? this.report.state.name : 'Borradores').toUpperCase()
                            }
                        },
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
        const paramsDialog = {
            width: '80vw',
            height: '80vh',
            data: {
                reportId: this.report.id,
                styles: '',
                content: ''
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
        return reviewers.map((reviewer: any) => {
            return {reportId: this.report.id, reviewerId: reviewer.id};
        });
    }

    public sendReview(reviewers: Array<object>) {
        this.http.post({
            path: 'reports/reviewers',
            data: {
                reportId: this.report.id,
                reviewers: this.getReviewers(reviewers)
            }
        }).subscribe((resp: any) => {
            if (resp) {
                this.dialog.open(ConfirmationDialogComponent, {
                    width: '410px',
                    data: {
                        config: {
                            title: 'Tu informe ha sido enviado a revisión:',
                            subtitle: this.report.name
                        }
                    }
                });
            }
            this.report.state = resp.body.report.state;
            this.report.stateId = resp.body.report.stateId;
        });
    }

    public onSendToRevisionAction(): void {
        this.http.get({
            path: 'users',
            data: {
                where: {
                    roles: 'Admin'
                }
            },
            encode: true
        }).subscribe((resp) => {
            this.users = resp.body;
            const dialogRef = this.dialog.open(RevisionModalComponent, {
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
            path: `reports/${this.report.id}`,
            data: {
                reviewed: false,
                stateId: '5e068d1cb81d1c5f29b62975'
            }
        }).subscribe((response: any) => {
            this.report.stateId = response.body.stateId;
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    config: {
                        title: 'Tu informe ha sido enviado a revisión con ajustes:',
                        subtitle: this.report.name
                    }
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
                    config: {
                        title: 'Tu informe ha sido aprobado:',
                        subtitle: this.report.name
                    }
                }
            });
            this.loadReport(this.report.id);
        });
    }

    public publishConfirmation() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    icon: 'icon-exclamation',
                    title: 'Está seguro que desea publicar el informe:',
                    subtitle: this.report.name,
                    mainButton: 'Si, publicar'
                }
            }
        });

        dialogRef.afterClosed().subscribe((resp: any) => {
            if (resp) {
                this.publish();
            }
        });
    }

    public publish() {
        this.report.reviewed = true;
        this.report.stateId = '5e068c81d811c55eb40d14d0';
        this.onSave(false, () => {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '410px',
                data: {
                    config: {
                        title: 'Tu informe ha sido publicado:',
                        subtitle: this.report.name
                    }
                }
            });
        });
    }

    public openUploadDialog(): void {
        const dialogRef = this.dialog.open(PdfUploadComponent, {
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
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Está seguro de enviar el reporte a la papelera?',
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                const data: object = {
                    trash: true
                };

                this.http.patch({
                    path: `reports/${this.report.id}`,
                    data
                }).subscribe(
                    (response: any) => {
                        this.dialog.open(ConfirmationDialogComponent, {
                            width: '410px',
                            data: {
                                config: {
                                    title: 'Ha sido eliminado exitosamente el informe:',
                                    subtitle: this.report.name
                                }
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
        const classes = [];

        if (this.templateType === 'pdf' || this.templateType === 'presentation') {
            classes.push('pdf-button');
        }

        // {'pdf-button': (templateType === 'pdf' || templateType === 'presentation'), showAsMobile ? 'mobile' : 'desktop'}
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
        for (const parentNode of element.path) {
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
        const codeMirror = new CodeMirror();
        const codeViewer = this.editor.CodeManager.getViewer('CodeMirror').clone();
        let viewerEditor = codeViewer.editor;
        const modal = this.editor.Modal;
        const grapesContent = this.editor.getHtml();
        const container = this.getModalContainer();
        const txtarea = container.children[1];
        const btn: HTMLElement = container.children[2] as HTMLElement;

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
        const pfx = this.editor.getConfig('stylePrefix');
        const container = document.createElement('div');
        const labelEl = document.createElement('div');
        const txtarea = document.createElement('textarea');
        const btnImp = document.createElement('button');

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
        const currentAuthors = this.list.authors.map((a: any) => a.author.id);
        return users.filter((a: any) => currentAuthors.indexOf(a.id) === -1 && this.user !== a.id && this.report.id !== a.id);
    }

    private onLoadUsers() {
        this.http.get({
            path: 'users/list'
        }).subscribe((response) => {
            const users = response.body as unknown as any[];
            this.list.users = this.getAvailableAuthors(users);
        });
    }

    private onLoadAuthors(idReport) {
        this.http.get({
            path: `reportAuthors`,
            data: {
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
            path: `reportAuthors/${authorId}`,
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
                path: `reportAuthors`,
                data: {
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
            path: `reports/editors?reportId=${reportId}`,
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
        const dataFilter = encodeURI(JSON.stringify({reportId}));
        this.http.patch({
            path: `notifications/read?filter=${dataFilter}`,
            data: {readed: true}
        }).subscribe();
    }

    private goToPrincipalPage(): void {
        this.router.navigate(['app/principal']);
    }

    /* Tags */
    public fillTendenciesTags(): Array<string> {
        return this.tendenciesList.split(',').map(tag => tag.trim());
    }

    public addCategoryTag(event): void {
        const tagName = event.target.innerText;
        this.tags.tendencies = this.fillTendenciesTags();
        if (!this.tags.tendencies.find(tag => tag === tagName)) {
            this.tendenciesList += `, ${tagName}`;
        }
    }

    public onSaveTags(): void {
        this.tags.tendencies = this.fillTendenciesTags();
        this.report.tags = this.tags.tendencies;
        this.http.patch({
            path: `reports/${this.report.id}`,
            data: {
                tags: this.tags.tendencies
            }
        }).subscribe((resp: any) => {
            if (resp) {
                this.showDialogOnSaveTag();
            }
        });
    }

    public onLoadTendenciesTags(): void {
        if (this.report.tags && this.report.tags.length) {
           this.tendenciesList = this.report.tags.join(', ');
        }
    }

    public onLoadCategoriesTags(): any {
        this.tags.categories = this.report.reportType && this.report.reportType.mainCategory
            && this.report.reportType.mainCategory.length
                ? this.report.reportType.mainCategory[0].tags : null;
        return this.tags.categories;
    }

    public showDialogOnSaveTag(): void {
        this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Los TAGS fueron agregados correctamente',
                }
            }
        });
    }

    private getUniqueId(parts: number): string {
        const stringArr = [];
        for (let i = 0; i < parts; i++) {
            // tslint:disable-next-line:no-bitwise
            const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            stringArr.push(S4);
        }
        return stringArr.join('-');
    }

    public removeEditorSection(block) {
        if (!!!block.isNew) {
            this.blocksToRemove.push(block);
        }
        this.blocks = this.blocks.filter(e => e.id !== block.id);
    }

    public addEditorSection(twocolumns: boolean, type?: string) {
        this.addMenuVisible = false;
        const block = {
            id: 'block' + this.getUniqueId(1),
            content: '',
            type: !twocolumns ? 'onecolumn' : type === 'left' ? 'twocolumns' : 'twocolumnsb',
            placeholder: !twocolumns ? 'CONTENT' : 'Escriba cuerpo de texto',
            initialized: true,
            isNew: true
        };
        this.blocks.push(block);
        setTimeout(() => {
            this.addInlineEditor(block.id, block.placeholder);
        }, 500);
    }

    public removeImageSelected(block: any) {
        const elementId = 'ImgInput' + block.id;
        const element = this.ref.nativeElement.querySelector( '#' + elementId );
        element.value = '';
    }

    public onBannerImageSelected(event: any) {
        const file: File = event && event.target && event.target.files && event.target.files.length ?
            event.target.files[0] : null;

        if (!file) {
            this.newBanner.fileName =  null;
            this.newBanner.file =  null;
            this.newBanner.imageUrl = null;
            this.newBanner.assetUrl = null;
            if (this.banner) {
                this.banner.toDelete = true;
            }

            const elementId = 'reportBannerImg';
            const element = this.ref.nativeElement.querySelector( '#' + elementId );
            element.value = '';
            return;
        }

        this.newBanner.fileName = file.name;
        this.newBanner.file = file;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            this.newBanner.imageUrl = reader.result;
        };
    }

    public onBlockImageSelected(block: any, event: any) {
        const file: File = event && event.target && event.target.files && event.target.files.length ?
            event.target.files[0] : null;

        if (!file) {
            block.fileName =  null;
            block.file =  null;
            block.imageUrl = null;
            block.assetUrl = null;
            this.removeImageSelected(block);
            return;
        }

        block.fileName = file.name;
        block.file = file;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            block.imageUrl = reader.result;
        };
    }
}

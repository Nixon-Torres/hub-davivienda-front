import { Component, EventEmitter, Input, OnInit, Output, NgZone } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { RevisionModalComponent } from '../../board/revision-modal/revision-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import {
    CustomClickEvent,
    TextSelectEvent,
} from 'src/app/directives/text-select.directive';

const COMMENT_TAG_NAME = 'mark';
const COMMENT_ATTRIBUTE_NAME = 'comment-id';

interface SelectionRectangle {
    left: number;
    top: number;
    width: number;
    height: number;
}

@Component({
    selector: 'app-mobile-detail-view',
    templateUrl: './mobile-detail-view.component.html',
    styleUrls: ['./mobile-detail-view.component.scss']
})
export class MobileDetailViewComponent implements OnInit {
    @Input() report: any = [];
    @Output() changeView = new EventEmitter();
    public user: any = {};
    private states: any = {
        draft: '5e068d1cb81d1c5f29b62977',
        toReview: '5e068d1cb81d1c5f29b62976',
        toCorrect: '5e068d1cb81d1c5f29b62975',
        approved: '5e068d1cb81d1c5f29b62974',
        published: '5e068c81d811c55eb40d14d0'
    };
    public isMediumUser = false;
    public isAdvancedUser = false;
    public commentToggle = false;
    public users: any = [];
    public unresolvedComments: any;
    public showComments:boolean = false;
    listComments: any;
    public myhtml: any = '';
    public threadId: string|number = null;
    private templatePlaceHolders: Array<string> = [];

    public hostRectangle: SelectionRectangle | null = null;
    private selectedText: string = '';
    private selectionInfo:any = null;
    public countGeneral: string = '';
    public countSpecific: string = '';

    constructor(
        private http: HttpService,
        private auth: AuthService,
        public dialog: MatDialog,
        private router: Router,
        private sanitizer: DomSanitizer,
        private zone: NgZone,
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;
            this.isMediumUser = this.user.roles.find(e => (e === 'medium'));
            this.isAdvancedUser = this.user.roles.find(e => (e === 'Admin' || e === 'medium'));
        });
    }

    back() {
        this.router.navigate(['app/principal']);
        this.changeView.emit({
            mobile: true,
            comment: false,
            reports: true
        });
    }

    changeViewComments() {
        this.showComments = false;
        this.threadId = null;
        this.selectionInfo = null;
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        this.loadReport();
        this.loadCommentCounts();
    }

    public loadReport(): void {
        this.http.get({
            'path': `reports/view?id=${this.report.id}`
        }).subscribe((response: any) => {
            this.report.styles = response.body.view.styles ? response.body.view.styles : '';
            this.report.content = response.body.view.content ? response.body.view.content : '';
            this.myhtml = this.sanitizer.bypassSecurityTrustHtml(response.body.view.content);
        });

        let include:Array<any> = [
            {
                relation: 'blocks',
                scope: {
                    order: 'createdAt ASC',
                }
            }];

        const filter = {
            include
        };

        this.http.get({
            'path': `reports/${this.report.id}?filter=${JSON.stringify(filter)}`
        }).subscribe((response: any) => {
            this.report = response.body;
            this.loadTemplate(this.report.templateId);
        });
    }

    closeDialog(): void {
    }

    openCommentDialog(report: any, specific: boolean): void {
        this.showComments = true;
        if (specific)
            this.threadId = 'LOAD_LATEST';
    }

    public canSendToRevision(): boolean {
        return this.report.stateId === this.states.draft || this.report.stateId === this.states.toCorrect;
    }

    public canReturnToEdit(): boolean {
        return this.report.stateId === this.states.toReview;
    }

    public canApprove(): boolean {
        return this.isAdvancedUser && !this.isMediumUser && this.report.ownerId !== this.user.id &&
            this.report.stateId === this.states.toReview;
    }

    public canPublish(): boolean {
        return this.isAdvancedUser && this.report.stateId === this.states.approved;
    }

    loadComments() {
        const filter = {
            include: ['user'],
            where: {reportId: this.report.id},
            order: 'createdAt ASC'
        };
        this.http.get({
            path: `comments?filter=${JSON.stringify(filter)}`
        }).subscribe(
            (response) => {
                this.listComments = response.body;
                this.unresolvedComments = this.hasUnresolvedComments(this.listComments);
            }
        );
    }

    hasUnresolvedComments(commentsList: any): object {
        const unresolvedCount = commentsList.filter(comment => comment.resolved === false).length;
        return {
            count: unresolvedCount,
            state: unresolvedCount > 0 ? true : false
        };
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
                this.openCommentDialog(this.report.id, false);
            });
        } else {
            this.publishConfirmation();
        }
    }

    public publishConfirmation() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
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

    public getReviewers(reviewers: Array<object>) {
        return reviewers.map((reviewer: any) => {
            return { reportId: this.report.id, reviewerId: reviewer.id };
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
                    width: '350px',
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
            path: 'users/list',
            data: {
                where: {
                    roles: 'Admin'
                }
            },
            encode: true
        }).subscribe((resp) => {
            this.users = (resp.body as any).filter(e => {
                return e.roles && e.roles.indexOf('Admin') > -1;
            });
            this.users = this.users.sort((a, b) => {
                if (a.name > b.name) {
                    return 1;
                }
                if (b.name > a.name) {
                    return -1;
                }
                return 0;
            });
            const dialogRef = this.dialog.open(RevisionModalComponent, {
                width: '350px',
                data: {
                    title: '¿Quien quiere que revise su informe?',
                    users: this.users.filter(e => e.id !== this.user.id)
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
                width: '350px',
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
                width: '350px',
                data: {
                    config: {
                        title: 'Tu informe ha sido aprobado:',
                        subtitle: this.report.name
                    }
                }
            });
            this.loadReport();
        });
    }

    public publish() {
        this.report.reviewed = true;
        this.report.stateId = '5e068c81d811c55eb40d14d0';
        this.onSave(false, () => {
            this.dialog.open(ConfirmationDialogComponent, {
                width: '350px',
                data: {
                    config: {
                        title: 'Tu informe ha sido publicado:',
                        subtitle: this.report.name
                    }
                }
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
        const data = Object.assign({}, this.report);
        delete data.state;

        this.http[method]({
            path,
            data
        }).subscribe((response: any) => {
            if (!autoSave) {
                if (cb) {
                    return cb();
                }
            }
        }, () => {
            alert('¡Oops! \n Tus datos no se almacenaron');
        });
    }

    private loadTemplate(templateId: string | number): void {
        if (!!!templateId) return;
        this.http.get({
            'path': `templates/${templateId}`
        }).subscribe((response: any) => {
            const template = response.body;
            this.templatePlaceHolders =
                template.content.match(/{{[{]?(.*?)[}]?}}/g)
                    .map(e => {
                        const replacer1 = new RegExp('{', 'g');
                        const replacer2 = new RegExp('}', 'g');
                        return e.replace(replacer1, '').replace(replacer2, '');
                    })
                    .filter(e => {
                        return this.report.hasOwnProperty(e);
                    });
        });
    }

    static striphtml(value:string|null) {
        if (!value || (value === '') || typeof value  != 'string') {
            return null;
        } else {
            return value
                .replace(/\s/g, '')
                .replace(/×/g, '')
                .replace(/<.*?>/g, '')
                .replace(/\xa0/g, '')
                .replace(/&nbsp;/g, '');
        }
    }

    public renderRectangles(event: TextSelectEvent): void {
        // There is a selection, validate it is part of any report placeholder
        let found = false;
        let key = null;
        let value = null;
        let block = null;
        const eventSelection: Selection = event.selection;
        if (!!!eventSelection) {
            this.hostRectangle = null;
            this.selectedText = "";
            return;
        }

        let node:any = eventSelection.anchorNode;

        while (node !== null) {
            for (let i = 0; i < this.templatePlaceHolders.length; i++) {
                key = this.templatePlaceHolders[i];
                value = MobileDetailViewComponent.striphtml(this.report[key]);
                if (!!!value) continue;

                const nodeHtml = MobileDetailViewComponent.striphtml(node.outerHTML);
                if (!!!nodeHtml) continue;
                if (nodeHtml && value === nodeHtml) {
                    found = true;
                    block = null;
                    break;
                }
            }
            if (found)
                break;
            node = node.parentNode;
        }

        // Try with blocks
        if (!found && this.report.blocks && this.report.blocks.length > 0) {
            node = eventSelection.anchorNode;
            const placeholders = ['content', 'title'];

            while (node !== null) {
                for (let i = 0; i < placeholders.length; i++) {
                    key = placeholders[i];
                    for (let j = 0; j < this.report.blocks.length; j++) {
                        value = MobileDetailViewComponent.striphtml(this.report.blocks[j][key]);
                        if (!!!value) continue;
                        let localId = 'unknown';
                        try {
                            localId = node.getAttribute('hub-block');
                        } catch (e) {
                        }
                        const nodeHtml = MobileDetailViewComponent.striphtml(node.outerHTML);
                        if (!!!nodeHtml) continue;
                        if (this.report.blocks[j].localId === localId &&
                            nodeHtml && value === nodeHtml) {
                            found = true;
                            block = localId;
                            break;
                        }
                    }
                    if (found)
                        break;
                }
                if (found)
                    break;
                node = node.parentNode;
            }
        }

        // Display comment CTA
        if (found && event.hostRectangle) {
            /*let textNode = (eventSelection.anchorNode as Text);
            let parentNode = eventSelection.anchorNode.parentNode;
            const targetNode = textNode.splitText(eventSelection.anchorOffset);
            targetNode.splitText(Math.min(eventSelection['extentOffset'], targetNode.length));
            const mark:HTMLElement = document.createElement(COMMENT_TAG_NAME);
            mark.setAttribute(COMMENT_ATTRIBUTE_NAME, '1231313');
            parentNode.insertBefore(mark, targetNode);
            mark.appendChild(targetNode);*/

            console.log(node['outerHTML'], key, value);

            this.hostRectangle = event.hostRectangle;
            this.selectedText = event.text;
            const selectedNode = eventSelection.anchorNode;
            let idx;
            for (idx = 0; idx < selectedNode.parentNode.childNodes.length; idx++) {
                if (selectedNode.parentNode.childNodes[idx] === selectedNode)
                    break;
            }
            this.selectionInfo = {
                selectedNodeName: selectedNode.nodeName,
                parentNodeName: selectedNode.parentNode.nodeName,
                selectedNodeData: selectedNode['data'],
                parentIndex: idx,
                parentChildrenLen: selectedNode.parentNode.childNodes.length,
                offset: Math.min(eventSelection.anchorOffset, eventSelection['extentOffset']),
                len: Math.max(eventSelection.anchorOffset, eventSelection['extentOffset']),
                section: key,
                block,
            };
        }
    }

    public contentOnClick(event: CustomClickEvent): void {
        if (event.target.attributes[COMMENT_ATTRIBUTE_NAME] &&
            this.threadId !== event.target.attributes[COMMENT_ATTRIBUTE_NAME].value) {
            this.zone.run(() => {
                this.threadId = event.target.attributes[COMMENT_ATTRIBUTE_NAME].value;
                this.showComments = true;
            });
        }
    }

    public onCommentAction(evt: any): void {
        this.selectionInfo = null;
        this.loadReport();
    }

    public createCommentFromSelection() {
        if (!!this.selectionInfo) {
            this.zone.run(() => {
                this.threadId = 'CREATE_NEW';
                this.showComments = true;
            });
        }
    }

    public loadCommentCounts() {
        let where = {
            reportId: this.report.id,
            type: 'GENERAL',
            resolved: false,
        };
        this.http.get({
            path: `comments/count?where=${JSON.stringify(where)}`
        }).subscribe(
            (response) => {
                if (response.body && response.body.hasOwnProperty('count')) {
                    this.countGeneral = String(response.body['count']);
                    if (this.countGeneral.length === 1 && this.countGeneral !== '0')
                        this.countGeneral = '0' + this.countGeneral;
                    else if (this.countGeneral === '0')
                        this.countGeneral = null;
                }
            }
        );

        where.type = 'THREAD';
        this.http.get({
            path: `comments/count?where=${JSON.stringify(where)}`
        }).subscribe(
            (response) => {
                if (response.body && response.body.hasOwnProperty('count')) {
                    this.countSpecific = String(response.body['count']);
                    if (this.countSpecific.length === 1 && this.countSpecific !== '0')
                        this.countSpecific = '0' + this.countSpecific;
                    else if (this.countSpecific === '0')
                        this.countSpecific = null;
                }
            }
        );
    }

    public toggleCommentMenu() {
        this.commentToggle = !this.commentToggle;
        this.loadCommentCounts();
    }
}

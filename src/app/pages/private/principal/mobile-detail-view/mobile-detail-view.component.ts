import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { RevisionModalComponent } from '../../board/revision-modal/revision-modal.component';

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
    public users: any = [];
    public unresolvedComments: any;
    showComments = false;
    listComments: any;
    constructor(
        private http: HttpService,
        private auth: AuthService,
        public dialog: MatDialog,
        private router: Router
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
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        this.loadComments();

        this.http.get({
            path: `reports/view?id=${this.report.id}`
        }).subscribe((response: any) => {
            this.report.styles = response.body.view.styles ? response.body.view.styles : '';
            this.report.content = response.body.view.content ? response.body.view.content : '';
            this.loadReport();
        });
    }

    public loadReport(): void {
        const iframe = document.getElementById('previewFrame');
        if (iframe) {
            const doc = (iframe as HTMLIFrameElement).contentWindow.document;
            const regex = new RegExp('href="\/reports\/' + this.report.id, 'gi');
            this.report.content = this.report.content.replace(
                regex, () => {
                    return `href="`;
                });
            const reportTpl = `
                <html>
                    <head>
                        <style type="text/css">${this.report.styles}</style>
                    </head>
                    <body>${this.report.content}</body>
                </html>
            `;

            doc.open();
            doc.write(reportTpl);
            doc.close();
        }
    }

    closeDialog(): void {
    }

    openCommentDialog(report: any): void {
        this.showComments = true;
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
                this.openCommentDialog(this.report.id);
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

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-mobile-detail-view',
    templateUrl: './mobile-detail-view.component.html',
    styleUrls: ['./mobile-detail-view.component.scss']
})
export class MobileDetailViewComponent implements OnInit {
    @Input() report: any;
    @Output() changeView = new EventEmitter();
    public user: any = {};
    private states: any = {
        draft: '5e068d1cb81d1c5f29b62977',
        toReview: '5e068d1cb81d1c5f29b62976',
        toCorrect: '5e068d1cb81d1c5f29b62975',
        approved: '5e068d1cb81d1c5f29b62974',
        published: '5e068c81d811c55eb40d14d0'
    };
    public isAdvancedUser = false;
    public unresolvedComments: any;
    constructor(
        private http: HttpService,
        private auth: AuthService,
        public dialog: MatDialog
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;
            this.isAdvancedUser = this.user.roles.find(e => (e === 'Admin' || e === 'medium'));
        });
    }

    back() {
        this.changeView.emit({
            report: this.report,
            mobile: true,
            comment: false,
            reports: true
        });
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

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
        this.changeView.emit({
            mobile: true,
            report,
            comment: true
        });
    }

    public canPublish(): boolean {
        return this.isAdvancedUser && this.report.stateId === this.states.approved;
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

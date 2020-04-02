import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../../../../services/auth.service';
import {HttpService} from '../../../../services/http.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {VideoModalComponent} from '../faq-content/video-modal/video-modal.component';
import {OutstandingVideosComponent} from '../outstanding-videos/outstanding-videos.component';

@Component({
    selector: 'app-multimedia',
    templateUrl: './multimedia.component.html',
    styleUrls: ['./multimedia.component.scss']
})
export class MultimediaComponent implements OnInit {
    @Output() changeView: EventEmitter<any>;
    public filterOptions: any;
    public marketing: boolean;
    public isAdding = false;
    public multimediaType: any;
    public multimediaList = [];
    public lastUpdater: any;
    public multimediaObj: any;

    constructor(
        private auth: AuthService,
        private http: HttpService,
        public dialog: MatDialog
    ) {
        this.marketing = this.auth.isMarketing();
        this.changeView = new EventEmitter<any>();
        this.multimediaType = null;
        this.multimediaObj = null;
        this.filterOptions = [
            {
                name: 'Video',
                icon: 'fa-play-circle-g',
            }, {
                name: 'Podcast',
                icon: 'fa-podcast',
            }, {
                name: 'Webinar',
                icon: 'fa-broadcast-tower',
            }
        ];
    }

    ngOnInit() {
        this.onLoadMultimedia();
    }

    changeViewFn() {
        this.changeView.emit({
            reports: true,
            editSite: false,
            faq: false,
            multimedia: false
        });
    }

    public openAddMultimedia(item) {
        this.isAdding = true;
        this.multimediaType = item;
        this.multimediaObj = null;
    }

    private onLoadMultimedia(filter?: any): void {
        this.http.get({
            path: 'contents',
            data: {
                include: ['lastUpdater'],
                where: {
                    key: 'multimedia'
                }
            },
            encode: true
        }).subscribe((resp: any) => {
            if (resp && resp.body) {
                this.lastUpdater = resp.body.lastUpdater ? resp.body.lastUpdater.name : '';
                if (filter) {
                    this.multimediaList = resp.body.filter(e => e.multimediaType.name === filter.name);
                } else {
                    this.multimediaList = resp.body;
                }
                this.addIconClass();
            }
        });
    }

    private addIconClass(): void {
        this.multimediaList.forEach((item) => {
            const option = this.filterOptions.find(e => e.name === item.multimediaType);
            item.iconClass = option ? option.icon : '';
        });
    }

    public onEditMultimedia(multimedia: any): void {
        if (multimedia && multimedia.params) {
            this.openAddMultimedia(this.multimediaType);
            this.multimediaType = multimedia.multimediaType;
            this.multimediaObj = multimedia;
        }
    }

    public confirmDeleteDialog(multimedia: any) {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    icon: 'icon-exclamation',
                    title: 'Está seguro que desea eliminar el contenido',
                    subtitle: multimedia.title,
                    mainButton: 'Si, eliminar'
                }
            }
        });
        dialog.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.onDeleteMultimedia(multimedia);
            }
        });
    }

    public onDeleteMultimedia(multimedia: any): void {
        this.http.delete({
            path: `contents/${multimedia.id}`
        }).subscribe((resp: any) => {
            if (resp) {
                this.onLoadMultimedia();
                this.dialog.open(ConfirmationDialogComponent, {
                    width: '410px',
                    data: {
                        config: {
                            title: 'Se ha eliminado el contenido',
                            subtitle: multimedia.title
                        }
                    }
                });
            }
        });
    }

    public openPreviewDialog(multimedia: any): void {
        const multimediaUrl = multimedia.params.url;
        const multimediaName = multimedia.title;
        this.dialog.open(VideoModalComponent, {
            width: '800px',
            data: {
                videoId: multimediaUrl,
                videoName: multimediaName,
            }
        });
    }

    public changeViewAndRefresh(event): void {
        this.isAdding = event;
        this.onLoadMultimedia();
    }

    public openOutstandingDialog(item): void {
        this.dialog.open(OutstandingVideosComponent, {
            width: '602px',
            data: item
        });
    }
    //TODO refactor filter
    public filterMultimedia(event): void {

    }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HttpService} from '../../../../services/http.service';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-outstanding-videos',
    templateUrl: './outstanding-videos.component.html',
    styleUrls: ['./outstanding-videos.component.scss']
})
export class OutstandingVideosComponent implements OnInit {
    public multimediaList: Array<any>;
    public multimedia: any;
    public multimediaNoHome: any;
    public outstandingHomeTabSelected: boolean;
    public outstandingArea: string;
    public outstandingList: Array<any>;
    public previousItem: any;
    public outstandingAreaList = [1, 2, 3];

    constructor(
        public dialogRef: MatDialogRef<OutstandingVideosComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpService
    ) {
    }

    ngOnInit() {
        this.onReset();
    }

    private onReset(): void {
        this.onLoadMultimediaList();
        this.onLoadOutstandingList();
        this.multimedia = this.data.id;
        this.multimediaNoHome = this.data.id;
        this.outstandingHomeTabSelected = true;
        this.previousItem = null;
    }

    public selectOutstanding(event): void {
        this.multimedia = event.id;
    }

    public setOutstandingHome(event) {
        this.outstandingHomeTabSelected = event.index === 0;
        this.onLoadOutstandingList();
    }

    public selectArea(event): void {
        const outstandingAreas = document.querySelectorAll<HTMLElement>('.outstanding');
        outstandingAreas.forEach((e: HTMLElement) => {
            e.classList.remove('active');
        });
        event.target.parentNode.classList.toggle('active');
    }

    public setOutstandingArea(event, area: string) {
        this.outstandingArea = area;
        this.previousItem = this.checkIfAreaIsTaken();
        this.selectArea(event);
    }

    public onSaveOutstanding(id?: string, modal?: boolean): void {
        const removingOutstandingItem = !!id;
        const data: any = {};

        if (this.outstandingHomeTabSelected) {
            data.outstandingHome = !removingOutstandingItem;
            data.outstandingHomeArea = removingOutstandingItem ? '' : this.outstandingArea;
        } else {
            data.outstanding = !removingOutstandingItem;
            data.outstandingArea = removingOutstandingItem ? '' : this.outstandingArea;
        }

        this.http.patch({
            path: `contents/${removingOutstandingItem ? id : this.multimedia}`,
            data
        }).subscribe((resp: any) => {
            if (resp) {
                this.previousItem = null;
                if (modal) {
                    const dialog = this.dialog.open(ConfirmationDialogComponent, {
                        width: '410px',
                        data: {
                            config: {
                                title: `El contenido ${resp.body.title} se ha destacado exitosamente`
                            }
                        }
                    });
                    dialog.afterClosed().subscribe(() => {});
                }
            }
        });
    }

    public onSave(): void {
        if (this.previousItem && (!this.multimedia || (this.previousItem.id !== this.multimedia))) {
            this.onSaveOutstanding(this.previousItem.id);
            this.onSaveOutstanding(null, true);
        } else {
            this.onSaveOutstanding(null, true);
        }
    }

    private onLoadMultimediaList(): void {
        this.http.get({
            path: 'contents',
            data: {
                where: {
                    key: 'multimedia'
                }
            },
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.multimediaList = resp.body;
            }
        });
    }

    private onLoadOutstandingList(): void {
        this.http.get({
            path: 'contents',
            data: {
                where: {
                    key: 'multimedia',
                    outstanding: true,
                    outstandingHome: this.outstandingHomeTabSelected
                }
            },
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.outstandingList = resp.body;
            }
        });
    }

    private checkIfAreaIsTaken() {
        const item = this.outstandingList.find(e => e.outstandingArea === this.outstandingArea);
        return item;
    }

    public closeDialog(): void {
        this.dialogRef.close();
    }

    onEvent(event) {
        event.stopPropagation();
    }
}

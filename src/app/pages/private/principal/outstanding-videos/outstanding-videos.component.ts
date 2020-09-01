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
    public outstandingArea: string;
    public outstandingList: Array<any>;
    public previousItems: any;
    public outstandingAreaList = [1, 2, 3];
    public sectionSelect: string;
    public remarkableReports: any = null;
    public selectedTab = 0;

    constructor(
        public dialogRef: MatDialogRef<OutstandingVideosComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpService
    ) {
        this.getRemarkablesReports();
    }

    ngOnInit() {
        this.onReset();
    }

    public getRemarkablesReports() {
        this.http.get({
            path: 'reports/',
            data: {where: {outstanding: true}},
            encode: true
        }).subscribe((response: any) => {
            this.remarkableReports = response.body;
        }, (error: any) => {
            console.error(error);
        });
    }

    onCheckSection(section) {
        this.sectionSelect = section;
        // this.pictureSelect = true;
    }

    isActive(section): boolean {
        return this.sectionSelect === section;
    }

    public openConfirmation(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Esta seguro que desea destacar un nuevo informe?',
                    isWarning: true,
                    warningText: 'Recientemente alguien ha destacado un informe en este módulo',
                    mainButton: 'Si, destacarlo',
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                const report = this.remarkableReports.find(element => element.outstandingArea === this.sectionSelect);
                if (report) {
                    report.outstandingArea = '';
                    report.outstanding = false;
                    this.updateReport(report, {outstandingArea: '', outstanding: false}, false);
                }
                // this.updateReport(this.report, {outstandingArea: this.sectionSelect, outstanding: true}, true);
            }
        });
    }

    public updateReport(report, data, updateImage) {
        this.http.patch({
            path: 'reports/' + report.id,
            data,
        }).subscribe((response: any) => {
            /*if (updateImage) {
                this.cloneImage(this.idImage, this.report.id, this.file ? this.file.id : null);
            }*/
        }, (error: any) => {
            console.error(error);
        });
    }

    private onReset(): void {
        this.onLoadMultimediaList();
        this.onLoadOutstandingList();
        this.multimedia = this.data.id;
        this.multimediaNoHome = this.data.id;
        this.selectedTab = 0;
        this.previousItems = null;
    }

    public selectOutstanding(event): void {
        this.multimedia = event.id;
    }

    public setOutstandingHome(event) {
        this.selectedTab = event.index;
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
        this.previousItems = this.checkIfAreaIsTaken();
        this.selectArea(event);
    }

    public onSaveOutstanding(id?: string, modal?: boolean): void {
        const removingOutstandingItem = !!id;
        const data: any = {};

        if (this.selectedTab === 1) {
            data.outstandingHome = !removingOutstandingItem;
            data.outstandingHomeArea = removingOutstandingItem ? '' : this.outstandingArea;
        } else if (this.selectedTab === 2) {
            data.outstanding = !removingOutstandingItem;
            data.outstandingArea = removingOutstandingItem ? '' : this.outstandingArea;
        } else if (this.selectedTab === 0) {
            data.outstandingMainHome = !removingOutstandingItem;
            data.outstandingMainHomeArea = removingOutstandingItem ? '' : this.sectionSelect;
        }

        this.http.patch({
            path: `contents/${removingOutstandingItem ? id : this.multimedia}`,
            data
        }).subscribe((resp: any) => {
            if (resp) {
                this.previousItems = null;
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
        const isSet = this.previousItems && this.previousItems.length === 1 ? this.previousItems[0].id === this.multimedia : false;
        this.previousItems = this.previousItems ? this.previousItems.filter(e => e.id !== this.multimedia) : [];

        if (this.previousItems && this.previousItems.length && (!this.multimedia || !isSet)) {
            this.previousItems.forEach((item) => {
                this.onSaveOutstanding(item.id, false);
            });
        }
        const report = this.remarkableReports.find(element => element.outstandingArea === this.sectionSelect);
        if (report) {
            report.outstandingArea = '';
            report.outstanding = false;
            this.updateReport(report, {outstandingArea: '', outstanding: false}, false);
        }

        this.onSaveOutstanding(null, true);
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
        const where: any = {
            key: 'multimedia'
        };

        if (this.selectedTab === 1) {
            where.outstandingHome = true;
        } else if (this.selectedTab === 2) {
            where.outstanding = true;
        } else {
            where.outstandingMainHome = true;
        }

        this.http.get({
            path: 'contents',
            data: {
                where
            },
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.outstandingList = resp.body;
            }
        });
    }

    private checkIfAreaIsTaken() {
        if (this.selectedTab === 1) {
            return this.outstandingList.filter(e => e.outstandingHomeArea === this.outstandingArea);
        } else if (this.selectedTab === 2) {
            return this.outstandingList.filter(e => e.outstandingArea === this.outstandingArea);
        }  else if (this.selectedTab === 0) {
            return this.outstandingList.filter(e => e.outstandingMainHomeArea === this.sectionSelect);
        }
    }

    public closeDialog(): void {
        this.dialogRef.close();
    }

    onEvent(event) {
        event.stopPropagation();
    }
}

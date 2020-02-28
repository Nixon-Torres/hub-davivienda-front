import {Component, OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {GalleryDialogComponent} from '../../gallery-dialog/gallery-dialog.component';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {environment} from '../../../../../environments/environment';
import {HttpService} from '../../../../services/http.service';

@Component({
    selector: 'app-highlight-dialog',
    templateUrl: './highlight-dialog.component.html',
    styleUrls: ['./highlight-dialog.component.scss']
})

export class HighlightDialogComponent implements OnInit {

    public sectionSelect = '';
    public pictureSelect = false;
    public storageBase: string = environment.STORAGE_FILES;
    public photo = '';
    public imageSelected = false;
    public reportId = '';
    public reportName = '';
    public idImage = '';
    public report: any = null;
    public file: any = null;
    public remarkableReports: any = null;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<HighlightDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.report = data.report;
        if (this.report.outstandingArea) 
            this.selectedArea(this.report);
    }

    ngOnInit() {
        this.getRemarkablesReports();
    }

    selectedArea(report) {
        this.sectionSelect = report.outstandingArea;
        this.getImage(report.id);
        this.imageSelected = true;
        this.pictureSelect = true;
    }

    getImage(id) {

        this.http.get({
            path: 'media/',
            data: {where: {resourceId: id}},
            encode: true
        }).subscribe((response: any) => {
            this.photo = response.body[0].fileName;
            this.file = response.body[0];
        }, (error: any) => {
            console.error(error);
        });
    }

    onCheckSection(section) {
        this.sectionSelect = section;
        this.pictureSelect = true;
    }

    isActive(section): boolean {
        return this.sectionSelect === section ? true : false;
    }

    onNoClick(): void {
        this.dialogRef.close({event: 'cancel'});
    }

    public openGallery(): void {
        const dialogRef = this.dialog.open(GalleryDialogComponent, {
            width: '900px',
            height: '500px',
            data: {name: this.reportName, id: this.reportId}
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result != undefined) {
                this.photo = result.data.name;
                this.imageSelected = true;
                this.idImage = result.data.id;
                this.file = result.data;
            }
            this.dialogRef.updateSize('760px', '900px');
        });

        this.dialogRef.updateSize('760px', '500px');
    }

    public onRemoveImage(): void {
        this.imageSelected = false;
        this.photo = '';
    }

    public onSave() {
        const alert = this.calculateTime();
        this.report.outstanding = true;
        this.report.outstandingArea = this.sectionSelect;

        if (alert) {
            // this.updateReport();
        } else {
            this.openConfirmation();
        }
    }

    public onUpdateImage() {
        this.file.resourceId = this.report.id;
        this.file.key = 'outstandingImage';

        this.http.patch({
            path: 'media/' + this.idImage,
            data: this.file
        }).subscribe((response: any) => {
            this.dialogRef.close({event: 'save'});
        }, (error: any) => {
            console.error(error);
        });
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

    public calculateTime(): boolean {
        // const found = this.remarkableReports.find(element => element.outstandingArea === this.sectionSelect);
        return false;
    }

    public openConfirmation(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                title: '¿Esta seguro que desea destacar un nuevo informe?',
                subtitle: '',
                warning: 'Recientemente alguien ha destacado un informe en este módulo',
                confirm: 'Si, destacarlo',
                alert: true,
                showWarning: true
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                const report = this.remarkableReports.find(element => element.outstandingArea == this.sectionSelect);
                if (report) {
                    report.outstandingArea = '';
                    report.outstanding = false;
                    this.updateReport(report, false);
                }
                this.updateReport(this.report, true);
            }
        });
    }

    public updateReport(report, updateImage) {
        this.http.patch({
            path: 'reports/' + report.id,
            data: report
        }).subscribe((response: any) => {
            if (updateImage) {
                this.onUpdateImage();
            }
        }, (error: any) => {
            console.error(error);
        });
    }

}

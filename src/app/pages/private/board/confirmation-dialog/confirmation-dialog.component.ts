import {Component, OnInit, Inject, Input, AfterViewInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';
import {PreviewDialogComponent} from '../preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-revision-modal',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit, AfterViewInit {
    title: string;
    subtitle: string;

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // this.report.id = this.data.reportId;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.title = this.data.title;
        this.subtitle = this.data.subtitle;
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';
import {PreviewDialogComponent} from '../preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-revision-modal',
  templateUrl: './revision-modal.component.html',
  styleUrls: ['./revision-modal.component.scss']
})
export class RevisionModalComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // this.report.id = this.data.reportId;
    }

    ngOnInit() {
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

}

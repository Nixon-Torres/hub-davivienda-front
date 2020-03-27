import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ConfigDialog} from './confirmation-dialog.model';

@Component({
    selector: 'app-revision-modal',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

    public config: ConfigDialog;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.config = this.data.config;
    }

    closeDialog(alert?: boolean): void {
        this.dialogRef.close(alert);
    }
}

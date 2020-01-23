import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PreviewDialogComponent } from '../preview-dialog/preview-dialog.component';

@Component({
    selector: 'app-revision-modal',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
    public title: string = null;
    public subtitle: string = null;

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.title = this.data.title;
        this.subtitle = this.data.subtitle;
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

}

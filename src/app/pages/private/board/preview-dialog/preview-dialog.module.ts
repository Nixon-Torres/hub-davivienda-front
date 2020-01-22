import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PreviewDialogComponent } from './preview-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { RevisionModalComponent } from '../revision-modal/revision-modal.component';

@NgModule({
    declarations: [PreviewDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule
    ],
    entryComponents: [
        PreviewDialogComponent,
        ConfirmationDialogComponent,
        RevisionModalComponent
    ]
})

export class PreviewDialogModule { }

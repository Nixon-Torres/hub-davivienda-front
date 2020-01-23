import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatButtonModule } from '@angular/material';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@NgModule({
    declarations: [ConfirmationDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule
    ],
    entryComponents: [
        ConfirmationDialogComponent
    ]
})

export class ConfirmationDialogModule { }

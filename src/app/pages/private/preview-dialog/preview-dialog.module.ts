import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PreviewDialogComponent } from './preview-dialog.component';
import { CommentBoxModule } from '../board/comment-box/comment-box.module';
import { MatGridListModule } from '@angular/material';

const materialModules: any[] = [
    MatGridListModule,
    MatDialogModule
];

@NgModule({
    declarations: [PreviewDialogComponent],
    imports: [
        CommonModule,
        CommentBoxModule,
        materialModules
    ],
    entryComponents: [
        PreviewDialogComponent
    ]
})

export class PreviewDialogModule { }

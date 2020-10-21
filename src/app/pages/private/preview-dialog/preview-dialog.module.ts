import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PreviewDialogComponent } from './preview-dialog.component';
import { CommentBoxModule } from '../board/comment-box/comment-box.module';
import { MatGridListModule } from '@angular/material';
import { TextSelectModule } from 'src/app/directives/text-select.module';

const materialModules: any[] = [
    MatGridListModule,
    MatDialogModule
];

@NgModule({
    declarations: [
        PreviewDialogComponent,
    ],
    imports: [
        CommonModule,
        CommentBoxModule,
        materialModules,
        TextSelectModule,
    ],
    entryComponents: [
        PreviewDialogComponent
    ],
    exports: [
        TextSelectModule,
    ]
})

export class PreviewDialogModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PreviewDialogComponent } from './preview-dialog.component';
import { CommentBoxModule } from '../board/comment-box/comment-box.module';
import { MatGridListModule } from '@angular/material';
import { TextSelectDirective } from 'src/app/directives/text-select.directive';

const materialModules: any[] = [
    MatGridListModule,
    MatDialogModule
];

@NgModule({
    declarations: [
        PreviewDialogComponent,
        TextSelectDirective,
    ],
    imports: [
        CommonModule,
        CommentBoxModule,
        materialModules,
    ],
    entryComponents: [
        PreviewDialogComponent
    ],
    exports: [
        TextSelectDirective,
    ]
})

export class PreviewDialogModule { }

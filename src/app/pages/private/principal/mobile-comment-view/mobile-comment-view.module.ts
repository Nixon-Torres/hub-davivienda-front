import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatDialogModule, MatButtonModule, MatCardModule, MatListModule,
    MatMenuModule, MatRippleModule, MatToolbarModule, MatGridListModule,
    MatExpansionModule, MatCheckboxModule, MatChipsModule, MatIconModule,
    MatFormFieldModule
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobileCommentViewComponent } from './mobile-comment-view.component';
import { CommentBoxModule } from '../../board/comment-box/comment-box.module';
import { CommentBoxComponent } from '../../board/comment-box/comment-box.component';

const materialModules: any[] = [
    MatCardModule,
    MatListModule,
    MatMenuModule,
    DragDropModule,
    MatButtonModule,
    MatRippleModule,
    MatToolbarModule,
    MatGridListModule,
    MatExpansionModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        materialModules,
        CommentBoxModule
    ],
    declarations: [
        MobileCommentViewComponent,
    ],
    entryComponents: [
        MobileCommentViewComponent
    ]
})

export class MobileCommentViewModule { }

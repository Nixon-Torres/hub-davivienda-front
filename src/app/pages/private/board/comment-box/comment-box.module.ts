import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatDialogModule, MatButtonModule, MatCardModule, MatListModule,
    MatMenuModule, MatRippleModule, MatToolbarModule, MatGridListModule,
    MatExpansionModule, MatCheckboxModule, MatChipsModule, MatIconModule,
    MatFormFieldModule
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommentBoxComponent } from './comment-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    ],
    declarations: [CommentBoxComponent],
    exports: [
        CommentBoxComponent,
    ],
    entryComponents: [
        CommentBoxComponent
    ]
})

export class CommentBoxModule { }

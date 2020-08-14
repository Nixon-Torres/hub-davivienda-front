import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatDialogModule, MatButtonModule, MatCardModule, MatListModule,
    MatMenuModule, MatRippleModule, MatToolbarModule, MatGridListModule,
    MatExpansionModule, MatCheckboxModule, MatChipsModule, MatIconModule,
    MatFormFieldModule,
} from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MobileDetailViewComponent } from './mobile-detail-view.component';
import { MobileCommentViewModule } from '../mobile-comment-view/mobile-comment-view.module';
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
        MobileCommentViewModule,
    ],
    declarations: [
        MobileDetailViewComponent,
    ],
    exports: [
        MobileDetailViewComponent,
    ],
    entryComponents: [
        MobileDetailViewComponent
    ]
})

export class MobileDetailViewModule { }
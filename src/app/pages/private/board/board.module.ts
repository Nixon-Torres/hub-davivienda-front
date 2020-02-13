import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { Routes, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';

import { BoardComponent } from './board.component';
import { PreviewDialogModule } from '../preview-dialog/preview-dialog.module';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { RevisionModalComponent } from './revision-modal/revision-modal.component';
import { ConfirmationDialogModule } from './confirmation-dialog/confirmation-dialog.module';
import { RelatedReportsComponent } from './related-reports/related-reports.component';


const routes: Routes = [
    {
        path: '',
        component: BoardComponent
    },
    {
        path: ':id',
        component: BoardComponent
    },
    {
        path: ':stateId/:sectionId/:sectionTypeKey/:folderId/:templateId/:reportId/:usersId',
        component: BoardComponent
    }
];

const materialModules: any[] = [
    MatRippleModule,
    MatButtonModule,
    MatToolbarModule,
    MatGridListModule,
    MatExpansionModule,
    MatCardModule,
    DragDropModule,
    MatListModule
];

@NgModule({
    declarations: [BoardComponent, CommentBoxComponent, RevisionModalComponent, RelatedReportsComponent],
    imports: [
        CommonModule,
        FormsModule,
        materialModules,
        PreviewDialogModule,
        ConfirmationDialogModule,
        NgSelectModule,
        NgOptionHighlightModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        materialModules
    ],
    entryComponents: [
        RevisionModalComponent
    ]
})
export class BoardModule { }

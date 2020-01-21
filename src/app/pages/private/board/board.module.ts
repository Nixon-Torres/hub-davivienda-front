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


import { BoardComponent } from './board.component';
import { PreviewDialogModule } from './preview-dialog/preview-dialog.module';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { RevisionModalComponent } from './revision-modal/revision-modal.component';
import { ConfirmationDialogModule } from './confirmation-dialog/confirmation-dialog.module';

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
        path: ':stateId/:sectionId/:sectionTypeKey/:folderId/:templateId/:reportId',
        component: BoardComponent
    }
];
const materialModules: any[] = [
    MatRippleModule,
    MatButtonModule,
	MatToolbarModule,
	MatGridListModule,
    MatExpansionModule,
    MatCardModule
];

@NgModule({
    declarations: [BoardComponent, CommentBoxComponent, RevisionModalComponent ],
    imports: [
        CommonModule,
        FormsModule,
		materialModules,
        PreviewDialogModule,
        ConfirmationDialogModule,
        RouterModule.forChild(routes)
    ],
  	exports: [
		materialModules
  	]
})
export class BoardModule { }

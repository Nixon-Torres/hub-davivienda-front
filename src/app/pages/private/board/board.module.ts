import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatDialogModule } from '@angular/material/dialog';
import { Routes, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import { BoardComponent } from './board.component';
import { PreviewDialogModule } from '../preview-dialog/preview-dialog.module';
import { CommentBoxComponent } from './comment-box/comment-box.component';
import { RelatedReportsComponent } from './related-reports/related-reports.component';
import { RevisionModalComponent } from './revision-modal/revision-modal.component';
import { ConfirmationDialogModule } from './confirmation-dialog/confirmation-dialog.module';
import { PdfUploadComponent } from './pdf-upload/pdf-upload.component';
import { CreationModalComponent } from './creation-modal/creation-modal.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {MatAutocompleteModule, MatInputModule} from '@angular/material';

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
        path: ':stateId/:sectionId/:sectionTypeKey/:folderId/:companyId/:templateId/:reportId/:authorsId',
        component: BoardComponent
    }
];

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
    declarations: [
        BoardComponent,
        CommentBoxComponent,
        RevisionModalComponent,
        RelatedReportsComponent,
        PdfUploadComponent,
        CreationModalComponent
    ],
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        materialModules,
        PreviewDialogModule,
        ConfirmationDialogModule,
        NgSelectModule,
        NgOptionHighlightModule,
        DragDropModule,
        MatListModule,
        RouterModule.forChild(routes),
        MatInputModule,
        MatAutocompleteModule
    ],
    exports: [
        materialModules
    ],
    entryComponents: [
        RevisionModalComponent,
        CreationModalComponent,
        PdfUploadComponent
    ]
})
export class BoardModule { }

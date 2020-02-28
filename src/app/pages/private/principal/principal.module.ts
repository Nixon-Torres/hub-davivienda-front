import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelect2Module } from 'ng-select2';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';

import { GalleryDialogModule } from '../gallery-dialog/gallery-dialog.module';
// Form Controls
import { MatNativeDateModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';

import { PrincipalComponent } from './principal.component';
import { PreviewDialogModule } from '../preview-dialog/preview-dialog.module';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { CreateReportDialogComponent } from './create-report-dialog/create-report-dialog.component';
import { ConfirmationDialogModule } from '../board/confirmation-dialog/confirmation-dialog.module';
import { NgSelectModule } from '@ng-select/ng-select';

import { HighlightDialogComponent } from './highlight-dialog/highlight-dialog.component';
import { EditSiteComponent } from './edit-site/edit-site.component';

import { InvestmentStrategiesComponent } from './investment-strategies/investment-strategies.component';
import { RelatedReportsComponent } from '../board/related-reports/related-reports.component';
import { MatListModule } from '@angular/material/list';
import { BannerComponent } from './banner/banner.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalComponent
    }
];

const materialModules: any[] = [
    MatTabsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSelectModule,
    MatListModule
];

@NgModule({
    declarations: [PrincipalComponent, LeftBarComponent, RightContentComponent, DialogBoxComponent, CreateReportDialogComponent, HighlightDialogComponent, EditSiteComponent, InvestmentStrategiesComponent, RelatedReportsComponent, BannerComponent],
    imports: [
        CommonModule,
        materialModules,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        NgSelect2Module,
        ConfirmationDialogModule,
        NgxDaterangepickerMd.forRoot(),
        PreviewDialogModule,
        NgSelectModule,
        GalleryDialogModule
    ],
    exports: [
        materialModules
    ],
    entryComponents: [
        DialogBoxComponent,
        HighlightDialogComponent,
        CreateReportDialogComponent,
        HighlightDialogComponent
    ]
})
export class PrincipalModule { }

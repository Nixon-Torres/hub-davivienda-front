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
import { MatIconModule, MatNativeDateModule, MatCardModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
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
import { HowIsEconomyComponent } from './how-is-economy/how-is-economy.component';
import { EditCompaniesComponent } from './edit-companies/edit-companies.component';
import { MatListModule } from '@angular/material/list';
import { BannerComponent } from './banner/banner.component';
import { FaqButtonComponent } from './faq-button/faq-button.component';
import { FaqContentComponent } from './faq-content/faq-content.component';
import { VideoModalModule } from './faq-content/video-modal/video-modal.module';
import { MatMenuModule } from '@angular/material/menu';
import { TagsDialogComponent } from './tags-dialog/tags-dialog.component';
import { AddWordsDialogComponent } from './add-words-dialog/add-words-dialog.component';
import { MultimediaComponent } from './multimedia/multimedia.component';
import { AddMultimediaComponent } from './multimedia/add-multimedia/add-multimedia.component';
import { OutstandingVideosModule } from './outstanding-videos/outstanding-videos.module';
import { EditBookComponent } from './edit-book/edit-book.component';
import { EditBookVersionsComponent } from './edit-book-versions/edit-book-versions.component';
import { EditIndicatorsComponent } from './edit-indicators/edit-indicators.component';
import { EditIndicatorsContentComponent } from './edit-indicators-content/edit-indicators-content.component';
import { EditFooterComponent } from './edit-footer/edit-footer.component';
import { ArraySortPipe } from 'src/app/pipes/array-sort.pipe';
import { MobileCommentViewModule } from './mobile-comment-view/mobile-comment-view.module';
import { MobileDetailViewModule } from './mobile-detail-view/mobile-detail-view.module';

const routes: Routes = [
    {
        path: '',
        component: PrincipalComponent
    }
];

const materialModules: any[] = [
    MatCardModule,
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
    MatListModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule
];

@NgModule({
    declarations: [
        PrincipalComponent,
        LeftBarComponent,
        RightContentComponent,
        DialogBoxComponent,
        CreateReportDialogComponent,
        HighlightDialogComponent,
        BannerComponent,
        EditSiteComponent,
        InvestmentStrategiesComponent,
        HowIsEconomyComponent,
        FaqButtonComponent,
        FaqContentComponent,
        EditCompaniesComponent,
        EditBookComponent,
        EditBookVersionsComponent,
        EditIndicatorsComponent,
        EditIndicatorsContentComponent,
        EditFooterComponent,
        TagsDialogComponent,
        AddWordsDialogComponent,
        MultimediaComponent,
        AddMultimediaComponent,
        ArraySortPipe
    ],
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
        GalleryDialogModule,
        VideoModalModule,
        OutstandingVideosModule,
        MobileCommentViewModule,
        MobileDetailViewModule
    ],
    exports: [
        materialModules,
        ArraySortPipe
    ],
    entryComponents: [
        DialogBoxComponent,
        HighlightDialogComponent,
        CreateReportDialogComponent,
        HighlightDialogComponent,
        TagsDialogComponent,
        AddWordsDialogComponent
    ]
})
export class PrincipalModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialogModule, MatButtonModule, MatNativeDateModule} from '@angular/material';
import { RelatedReportsComponent} from './related-reports.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {FormsModule} from '@angular/forms';

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
    declarations: [RelatedReportsComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatListModule,
        FormsModule
    ],
    exports: [materialModules, RelatedReportsComponent],
    entryComponents: [
        RelatedReportsComponent
    ]
})

export class RelatedReportsModule { }

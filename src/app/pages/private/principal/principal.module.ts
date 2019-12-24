import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PrincipalComponent } from './principal.component';

import { Routes, RouterModule } from '@angular/router';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';

import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
// Form Controls
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


import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { FormsModule } from '@angular/forms';

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
	MatFormFieldModule,
	MatInputModule,
	MatRadioModule,
	MatSliderModule,
	MatSlideToggleModule,
	MatButtonModule
];

@NgModule({
	declarations: [PrincipalComponent, LeftBarComponent, RightContentComponent, DialogBoxComponent],
	imports: [
		CommonModule,
		materialModules,
		FormsModule,
		RouterModule.forChild(routes)
	],
	exports: [
		materialModules
	],
	entryComponents: [
		DialogBoxComponent
	]
})
export class PrincipalModule { }

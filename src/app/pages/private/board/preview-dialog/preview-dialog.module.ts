import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PreviewDialogComponent } from './preview-dialog.component';

@NgModule({
  declarations: [PreviewDialogComponent],
  imports: [
    CommonModule,
    	MatDialogModule
  	],
	entryComponents: [
		PreviewDialogComponent
	]
})

export class PreviewDialogModule { }

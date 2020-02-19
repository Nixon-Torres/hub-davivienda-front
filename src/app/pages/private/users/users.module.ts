import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { Routes, RouterModule } from '@angular/router';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';
import { GalleryDialogComponent } from './gallery-dialog/gallery-dialog.component';

import { MatDialogModule } from '@angular/material/dialog';


const routes: Routes = [{
	path: '',
	component: UsersComponent
}];

const materialModules: any[] = [
	MatDialogModule
];

@NgModule({
	declarations: [UsersComponent, LeftBarComponent, RightContentComponent, GalleryDialogComponent],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		materialModules
	],
	exports: [
		materialModules
	],
	entryComponents: [
		GalleryDialogComponent
	]
})
export class UsersModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { Routes, RouterModule } from '@angular/router';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';
import { GalleryDialogComponent } from './gallery-dialog/gallery-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { ProfileFormComponent } from './profile-form/profile-form.component';
import { UserFormComponent } from './user-form/user-form.component';


const routes: Routes = [{
	path: '',
	component: UsersComponent
}];

const materialModules: any[] = [
	MatDialogModule
];

@NgModule({
	declarations: [UsersComponent, LeftBarComponent, RightContentComponent, GalleryDialogComponent, ProfileFormComponent, UserFormComponent],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		materialModules,
		FormsModule,
		ReactiveFormsModule
	],
	exports: [
		materialModules
	],
	entryComponents: [
		GalleryDialogComponent
	]
})
export class UsersModule { }

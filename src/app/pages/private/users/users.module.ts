import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { Routes, RouterModule } from '@angular/router';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';


const routes: Routes = [{
	path: '',
	component: UsersComponent
}];

@NgModule({
  declarations: [UsersComponent, LeftBarComponent, RightContentComponent],
  imports: [
	CommonModule,
	RouterModule.forChild(routes)
  ]
})
export class UsersModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { PrincipalComponent } from './principal.component';

import { Routes, RouterModule } from '@angular/router';
import { LeftBarComponent } from './left-bar/left-bar.component';
import { RightContentComponent } from './right-content/right-content.component';

import { MatTabsModule } from '@angular/material/tabs';


const routes: Routes = [
  {
	path: '',
	component: PrincipalComponent
  }
];


const materialModules: any[] = [
	MatTabsModule
];

@NgModule({
  declarations: [PrincipalComponent, LeftBarComponent, RightContentComponent],
  imports: [
	CommonModule,
	materialModules,
	RouterModule.forChild(routes)
  ],
  exports: [
	materialModules
  ]
})
export class PrincipalModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board.component';

import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        component: BoardComponent
    }
];

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
const materialModules: any[] = [
	MatToolbarModule,
	MatGridListModule
];

@NgModule({
    declarations: [BoardComponent],
    imports: [
        CommonModule,
		materialModules,
        RouterModule.forChild(routes)
    ],
  	exports: [
		materialModules
  	]
})
export class BoardModule { }

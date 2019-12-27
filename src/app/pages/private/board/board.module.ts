import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { Routes, RouterModule } from '@angular/router';


import { BoardComponent } from './board.component';

const routes: Routes = [
    {
        path: '',
        component: BoardComponent
    }
];
const materialModules: any[] = [
    MatButtonModule,
	MatToolbarModule,
	MatGridListModule,
    MatExpansionModule
];

@NgModule({
    declarations: [BoardComponent],
    imports: [
        CommonModule,
        FormsModule,
		materialModules,
        RouterModule.forChild(routes)
    ],
  	exports: [
		materialModules
  	]
})
export class BoardModule { }

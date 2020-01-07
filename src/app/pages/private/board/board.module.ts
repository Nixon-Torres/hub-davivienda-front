import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { Routes, RouterModule } from '@angular/router';


import { BoardComponent } from './board.component';
import { PreviewDialogModule } from './preview-dialog/preview-dialog.module';

const routes: Routes = [
    {
        path: '',
        component: BoardComponent
    },
    {
        path: ':id',
        component: BoardComponent
    }
];
const materialModules: any[] = [
    MatRippleModule,
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
        PreviewDialogModule,
        RouterModule.forChild(routes)
    ],
  	exports: [
		materialModules
  	]
})
export class BoardModule { }

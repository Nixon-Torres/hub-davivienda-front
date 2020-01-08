import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';

import { NotFoundComponent } from './not-found.component';

const routes: Routes = [
    {
        path: '',
        component: NotFoundComponent
    }
];

@NgModule({
    declarations: [NotFoundComponent],
    imports: [
        MatGridListModule,
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class NotFoundModule { }

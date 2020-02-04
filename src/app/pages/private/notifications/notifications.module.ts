import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; 

import { NotificationsComponent } from './notifications.component'; 

const routes: Routes = [{
    path: '',
    component: NotificationsComponent
}];

@NgModule({
	declarations: [
		NotificationsComponent,
	],
	imports: [
		CommonModule,
		MatCardModule,
		RouterModule.forChild(routes)
	],
    exports: [
        MatCardModule
    ]
})

export class NotificationsModule { }

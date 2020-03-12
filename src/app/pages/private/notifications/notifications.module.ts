import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core'; 

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
		MatRippleModule,
		MatSidenavModule,
		RouterModule.forChild(routes)
	],
    exports: [
        MatCardModule,
        MatSidenavModule
    ]
})

export class NotificationsModule { }

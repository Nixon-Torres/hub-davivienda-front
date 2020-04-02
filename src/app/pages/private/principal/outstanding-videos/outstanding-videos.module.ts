import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatButtonModule } from '@angular/material';
import {OutstandingVideosComponent} from './outstanding-videos.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {MatTabsModule} from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        OutstandingVideosComponent,
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        NgSelectModule,
        FormsModule
    ],
    entryComponents: [
        OutstandingVideosComponent
    ]
})

export class OutstandingVideosModule { }

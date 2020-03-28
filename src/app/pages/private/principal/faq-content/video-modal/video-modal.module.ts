import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material';
import {VideoModalComponent} from './video-modal.component';

@NgModule({
    declarations: [VideoModalComponent],
    imports: [
        CommonModule,
        MatDialogModule
    ],
    entryComponents: [
        VideoModalComponent
    ]
})

export class VideoModalModule { }

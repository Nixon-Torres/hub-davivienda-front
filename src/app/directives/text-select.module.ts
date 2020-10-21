import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextSelectDirective } from 'src/app/directives/text-select.directive';

@NgModule({
    declarations: [
        TextSelectDirective,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        TextSelectDirective,
    ]
})
export class TextSelectModule { }

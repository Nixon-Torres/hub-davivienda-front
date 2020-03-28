import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-faq-button',
    templateUrl: './faq-button.component.html',
    styleUrls: ['./faq-button.component.scss']
})
export class FaqButtonComponent implements OnInit {
    @Output() changeView: EventEmitter<object>;

    constructor() {
        this.changeView = new EventEmitter(true);
    }

    ngOnInit() {
    }

    public onChangeView(): void {
        this.changeView.emit({
            reports: false,
            editSite: false,
            faq: true
        });
    }
}

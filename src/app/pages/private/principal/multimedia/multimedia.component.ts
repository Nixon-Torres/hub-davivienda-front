import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../../../../services/auth.service';

@Component({
    selector: 'app-multimedia',
    templateUrl: './multimedia.component.html',
    styleUrls: ['./multimedia.component.scss']
})
export class MultimediaComponent implements OnInit {
    @Output() changeView: EventEmitter<any>;
    public filterOptions: any;
    public marketing: boolean;

    constructor(
        private auth: AuthService
    ) {
        this.marketing = this.auth.isMarketing();
        this.changeView = new EventEmitter<any>();
        this.filterOptions = [
            {
                name: 'Videos',
                icon: 'fa-play-circle-g',
            }, {
                name: 'Podcast',
                icon: 'fa-podcast',
            }, {
                name: 'Webinar',
                icon: 'fa-broadcast-tower',
            }
        ];
    }

    ngOnInit() {
    }

    changeViewFn() {
        this.changeView.emit({
            reports: true,
            editSite: false,
            faq: false,
            multimedia: false
        });
    }

}

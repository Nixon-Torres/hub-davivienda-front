import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-principal',
    templateUrl: './principal.component.html',
    styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {
    currentObj = {};
    cleanObj = true;
    public view: any = {
        reports: true,
        editSite: false,
        faq: false,
        multimedia: false
    };

    constructor() {
    }

    ngOnInit() {
    }

    setCurrentState(value: any) {
        this.view = {
            reports: true
        };
        this.cleanObj = value;
        this.currentObj = {
            currentFolder: value ? value.folder : null,
            currentState: value ? value.state : null,
            deletedFg: value ? value.deleted : false,
            currentStateName: value ? value.stateName : 'Todos Informes',
            currentCategory: value ? value.category : null,
            currentSearch: value ? value.search : null,
        };
    }

    changeView(event) {
        console.log(event);
        this.view = event;
    }
}

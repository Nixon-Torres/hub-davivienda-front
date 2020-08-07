import {Component, OnInit} from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
    selector: 'app-principal',
    templateUrl: './principal.component.html',
    styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {
    currentObj = {};
    cleanObj = true;
    sideBarOpenMenu = false;
    sideBarCloseMenu = false;
    public view: any = {
        reports: true,
        editSite: false,
        faq: false,
        multimedia: false
    };
 
    constructor(private sharedService: SharedService) {
    }

    ngOnInit() {
        this.sharedService.sharedMessage.subscribe(res => {
            if(res != "") {
                let message = JSON.parse(res);
                this.sideBarOpenMenu =  message.sideBarOpenMenu;
                this.sideBarCloseMenu = message.sideBarCloseMenu;
            }
        })
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
            currentCategory: value ? value.category : null
        };
    }

    changeView(event) {
        console.log(event);
        this.view = event;
    }
}

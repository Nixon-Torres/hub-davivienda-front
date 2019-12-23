import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';

@Component({
    selector: 'app-left-bar',
    templateUrl: './left-bar.component.html',
    styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {
    public list: any = {
        folders: [],
        states: []
    }

    constructor(
        private http: HttpService
    ) { }

    ngOnInit() {
        this.loadFolders();
        this.loadStates();
    }

    private loadFolders() {
        this.http.get({
            'path': 'folders'
        }).subscribe((response) => {
            this.list.folders = response.body;
        });
    }

    private loadStates() {
        this.http.get({
            'path': 'states'
        }).subscribe((response) => {
            this.list.states = response.body;
        });
    }

}

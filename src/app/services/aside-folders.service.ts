import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { loopback } from '../models/common/loopback.model';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AsideFoldersService {
    private list: any = {
        folders: [],
        states: []
    }

    public listenFolders;
    public $listenFolders;
    public foldersSubs;
    public listenStates;
    public $listenStates;
    public statesSubs;

    constructor(private http: HttpService) {
        console.log('aside-service');
        this.listenFolders = new Subject();
        this.listenStates = new Subject();
        this.$listenFolders = this.listenFolders.asObservable();
        this.$listenStates = this.listenStates.asObservable();
        this.loadStates();
        this.loadFolders();
    }

    private loadFolders() {
        var query = new loopback();
        query.filter.include.push({ relation: "reports", scope: { where: { trash: false }, type: "count" } });
        this.http.get({
            path: 'folders',
            data: query.filter,
            encode: true
        }).subscribe((response) => {
            this.list.folders = this.updateFolders(response.body);
        });
    }
    private loadStates() {
        var query = new loopback();
        query.filter.include.push({ relation: "reports", scope: { where: { trash: false } } });
        this.http.get({
            path: 'states',
            data: query.filter,
            encode: true
        }).subscribe((response) => {
            this.list.states = this.updateStates(response.body);
        });
    }

    private updateFolders(folder: any) {
        if (folder) {
            this.listenFolders.next(folder);
        }
    }
    private updateStates(states: any) {
        if (states) {
            this.listenStates.next(states);
        }
    }

    get folderList() {
        return this.list.folders;
    }

    set folderList(value: Array<any>) {
        this.list.folder = value;
    }

    get stateList() {
        return this.list.states;
    }

    set stateList(value: Array<any>) {
        this.list.states = value;
    }

}

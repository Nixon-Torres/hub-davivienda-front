import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { HttpService } from './http.service';
import { AuthService } from './auth.service';
import { loopback } from '../models/common/loopback.model';

@Injectable({
  providedIn: 'root'
})
export class AsideFoldersService {
  private list: any = {
    folders: [],
    states: []
  }

  public listenFolders: Subject<any>;
  public $listenFolders: Observable<any>;
  public foldersSubs;
  public listenStates: Subject<any>;
  public $listenStates: Observable<any>;
  public statesSubs;
  public newActiveFolder: Subject<any>;
  public $listenActiveFolder: Observable<any>;

  constructor(
      private http: HttpService,
      private auth: AuthService
  ) {
    this.listenFolders = new Subject();
    this.listenStates = new Subject();
    this.newActiveFolder = new Subject();

    this.$listenFolders = this.listenFolders.asObservable();
    this.$listenStates = this.listenStates.asObservable();
    this.$listenActiveFolder = this.newActiveFolder.asObservable();
    this.loadStates();
    this.loadFolders();
  }

  public loadFolders() {
    var query = new loopback();
    query.filter.include.push({
      relation: "reports",
        scope: {
          where: { trash: false, ownerId:  this.auth.getUserData('id') },
          type: "count"
        }
    });
    this.http.get({
      path: 'folders',
      data: query.filter,
      encode: true
    }).subscribe((response) => {
      this.list.folders = this.updateFolders(response.body);
    });
  }

  public loadStates() {
    var query = new loopback();
    query.filter.include.push({
      relation: "reports",
        scope: {
          where: { trash: false, ownerId:  this.auth.getUserData('id') },
          type: "count"
        }
    });
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

  set newActive (id: string) {
    this.newActiveFolder.next(id);
  }

}

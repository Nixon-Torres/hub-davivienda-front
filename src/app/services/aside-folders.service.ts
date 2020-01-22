import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { loopback } from '../models/common/loopback.model';
import * as qs from 'qs';
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
  public newActiveFolder;
  public $listenActiveFolder;
  
  constructor(private http: HttpService) { 
    console.log('aside-service');
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
    query.filter.include.push({ relation: "reports", scope: {where: {trash: false }}});
    console.log('query folders',JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));
    
    this.http.get({
      path: 'folders?'+qs.stringify(query,{skipNulls: true })
    }).subscribe((response) => {
      this.list.folders = this.updateFolders(response.body);
    });
  }
  public loadStates() {
    var query = new loopback();
    query.filter.include.push({ relation: "reports", scope: {where: {trash: false }}});
    console.log('query states', JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));

    this.http.get({
        path: 'states?'+qs.stringify(query,{skipNulls: true })
    }).subscribe((response) => {
        this.list.states = this.updateStates(response.body);
    });
  }

  private updateFolders(folder) {
    if(folder) {
        this.listenFolders.next(folder);
    }
  }
  private updateStates(states) {
    if(states) {
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

  set stateList (value: Array<any>) {
    this.list.states = value;
  }

  set newActive (id: string) {
    this.newActiveFolder.next(id);
  }

}

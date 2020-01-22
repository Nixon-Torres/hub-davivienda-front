import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { loopback } from '../models/common/loopback.model';
import * as qs from 'qs';


@Injectable({
  providedIn: 'root'
})
export class AsideFoldersService {


  private list: any = {
    folders: [],
    states: []
  }
  
  constructor(private http: HttpService) { 
    this.loadStates();
    this.loadFolders();
  }

  private loadFolders() {
    var query = new loopback();
    query.filter.include.push({ relation: "reports", scope: {where: {trash: false }}});
    console.log('query folders',JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));

    this.http.get({
        path: 'folders?'+qs.stringify(query,{skipNulls: true })
    }).subscribe((response) => {
        this.list.folders = response.body;
    });
  }
  private loadStates() {
    var query = new loopback();
    query.filter.include.push({ relation: "reports", scope: {where: {trash: false }}});
    console.log('query states', JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));

    this.http.get({
        path: 'states?'+qs.stringify(query,{skipNulls: true })
    }).subscribe((response) => {
        this.list.states = response.body;
    });
  }

  get foldersList() {
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




}

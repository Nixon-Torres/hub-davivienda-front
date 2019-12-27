import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogBoxComponent} from '../dialog-box/dialog-box.component';
import * as qs from 'qs';
import {loopback} from '../../../../models/common/loopback.model'

@Component({
    selector: 'app-left-bar',
    templateUrl: './left-bar.component.html',
    styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {

    @Output() valueChange = new EventEmitter();
    @Output() folderChange = new EventEmitter();
    @Output() deleteChange = new EventEmitter();

    private currentState: string;
    private currentFolder: string;
    private deletedStateEnabled = false;

    public list: any = {
        folders: [],
        states: []
    }

    constructor(
        private http: HttpService,
        public dialog: MatDialog
    ) {
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(DialogBoxComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: '500px',
            data: this.list.folders
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    ngOnInit() {
        this.loadFolders();
        this.loadStates();
    }

    private loadFolders() {
        var query = new loopback();        
        query.filter.include.push({ relation : "reports"});  
        console.log('query folders',JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));  
        
        this.http.get({
            path: 'folders?'+qs.stringify(query,{skipNulls: true }) 
        }).subscribe((response) => {
            this.list.folders = response.body;
        });          
    }

    private loadStates() {
        var query = new loopback();        
        query.filter.include.push({ relation : "reports"})  
        console.log('query states',JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));   

        this.http.get({
            path: 'states?'+qs.stringify(query,{skipNulls: true }) 
        }).subscribe((response) => {
            this.list.states = response.body;
        });       
    }

    setDeletedState() {
        this.deletedStateEnabled = true;
        this.currentState = null;
        this.valueChange.emit({state: null, deleted: true, folder: null});
    }

    setCurrentState(state: string) {
        this.deletedStateEnabled = false;
        this.currentState = state;
        this.valueChange.emit({state, deleted: false, folder: this.currentFolder});
    }

    setCurrentFolder(folder: string) {
        this.deletedStateEnabled = false;
        this.currentFolder = folder;
        this.valueChange.emit({state: this.currentState, deleted: false, folder});
    }

    isItemActive(state: string) {
        return this.currentState === state;
    }

    isFolderActive(folder: string) {
        return this.currentFolder === folder;
    }

    isDeleteActive(folder: string) {
        return this.deletedStateEnabled;
    }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';

@Component({
    selector: 'app-left-bar',
    templateUrl: './left-bar.component.html',
    styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {

    @Output() valueChange = new EventEmitter();
    @Output() folderChange = new EventEmitter();
    @Output() deleteChange = new EventEmitter();

    private currentState: any;
    private currentFolder: any;
    private deletedStateEnabled = false;

    public list: any = {
        folders: [],
        states: []
    }

    @Input()
    set currentObj(value: any) {
        if (value) {
            return;
        }
        this.currentState = null;
        this.currentFolder = null;
        this.deletedStateEnabled = false;
    }

    constructor(
        public dialog: MatDialog,
        private foldersService: AsideFoldersService
    ) {
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(DialogBoxComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: '500px',
            data: this.list.folders.filter((a: any) => a.id !== 'shared')
        });

        dialogRef.afterClosed().subscribe((result : any) => {
            result ? this.foldersService.loadFolders() : null;
        });
    }

    ngOnInit() {
        this.loadFolders();
        this.loadStates();
        this.foldersService.$listenActiveFolder.subscribe((folder: string) => {
            this.setCurrentFolder(folder);
        });
    }

    private loadFolders() {
        this.foldersService.$listenFolders.subscribe((data: any) => {
            this.list.folders = data;
        });
        this.foldersService.loadFolders();
    }
    private loadStates() {
        this.foldersService.$listenStates.subscribe((data: any) => {
            this.list.states = data;
        });
        this.foldersService.loadStates();
    }

    setDeletedState() {
        this.deletedStateEnabled = true;
        this.currentState = null;
        this.valueChange.emit({ state: null, deleted: true, folder: null, stateName: 'Eliminados' });
    }

    setCurrentState(state: any) {
        this.deletedStateEnabled = false;
        this.currentState = state;
        this.valueChange.emit({ state: state.id, deleted: false, folder: this.currentFolder ? this.currentFolder.id : null, stateName: state.name });
    }

    setCurrentFolder(folder: any) {
        this.deletedStateEnabled = false;
        this.currentFolder = folder;
        this.valueChange.emit({ state: this.currentState ? this.currentState.id : null, deleted: false, folder: folder.id, stateName: folder.name });
    }

    isItemActive(state: string) {
        return this.currentState && this.currentState.id === state;
    }

    isFolderActive(folder: string) {
        return this.currentFolder && this.currentFolder.id === folder;
    }

    isDeleteActive() {
        return this.deletedStateEnabled;
    }

}

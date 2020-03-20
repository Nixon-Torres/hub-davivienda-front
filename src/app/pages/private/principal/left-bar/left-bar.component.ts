import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';
import { UsersService } from '../../../../services/users.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-left-bar',
    templateUrl: './left-bar.component.html',
    styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {

    @Output() valueChange = new EventEmitter();
    @Output() folderChange = new EventEmitter();
    @Output() deleteChange = new EventEmitter();
    @Output() changeView = new EventEmitter();

    private static ROLE: String = 'Admin';

    private currentState: any;
    private currentFolder: any;
    private deletedStateEnabled = false;
    public showMenu: boolean = false;
    public user: any = {};
    public marketing: boolean;

    public list: any = {
        folders: [],
        states: [],
        categories: []
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
        private foldersService: AsideFoldersService,
        private auth: AuthService,
    ) {
        this.user = this.auth.getUserData();
        this.marketing = this.auth.isMarketing();
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
        this.setShowMenu();
        if(this.marketing) {
            this.loadCategories();
        }
    }
    private loadCategories() {
        this.list.categories = [{
            name: 'Actualidad financiera',
            count: 0,
        }, {
            name: 'Informes especializados',
            count: 0,
        }, {
            name: 'Región centroamericana',
            count: 0,
        }, {
            name: 'Experiencia sectorial',
            count: 0,
        }, {
            name: 'Sector empresarial',
            count: 0,
        }, {
            name: '¿Cómo invertir?',
            count: 0,
        }, {
            name: 'Recursos interactivos',
            count: 0,
        }, {
            name: '¿Quiénes somos?',
            count: 0,
        }]
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

    changeViewFn(view: any) {
        this.changeView.emit(view);
    }

    public setShowMenu() {
        let found = this.user.roles.find(element => element === LeftBarComponent.ROLE);
        this.showMenu = found === undefined ? false : true ;
        return this.showMenu;
    }
}

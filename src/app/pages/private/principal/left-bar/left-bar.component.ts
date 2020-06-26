import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';
import { UsersService } from '../../../../services/users.service';
import { AuthService } from '../../../../services/auth.service';
import {HttpService} from '../../../../services/http.service';

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

    readonly ADMIN_ROLE = 'Admin';
    readonly MEDIUM_ROLE = 'medium';

    private currentState: any;
    private currentFolder: any;
    private currentCategory: any;
    private deletedStateEnabled = false;
    public showEditSiteMenu = false;
    public showMultimediaMenu = false;
    public user: any = {};
    public marketing: boolean;
    public categories: any;
    public categoriesCount: any;

    public list: any = {
        folders: [],
        states: [],
        categories: []
    };

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
        private http: HttpService
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;
        });
        this.marketing = this.auth.isMarketing();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(DialogBoxComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: '500px',
            data: this.list.folders.filter((a: any) => a.id !== 'shared')
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.foldersService.loadFolders();
            };
        });
    }

    ngOnInit() {
        this.loadFolders();
        this.loadStates();
        this.foldersService.$listenActiveFolder.subscribe((folder: string) => {
            this.setCurrentFolder(folder);
        });
        this.setShowMenu();
        if (this.marketing) {
            this.loadCategories();
        }
    }

    private loadCategories() {
        this.http.get({
            path: `categories/`,
            data: {
                where: {
                    parentId: {
                        inq: [null]
                    }
                },
                include: ['childrenMainReportTypes']
            },
            encode: true
        }).subscribe((response: any) => {
            this.categories = response.body;
            this.loadCategoriesCount();
        });
    }

    private loadCategoriesCount() {
        this.http.get({
            path: `categories/counts`,
            data: {
                where: {
                    parentId: {
                        inq: [null]
                    }
                }
            },
            encode: true
        }).subscribe((response: any) => {
            this.categoriesCount = response.body ? response.body.counts : [];
            this.categories = this.categories.map(e => {
                const obj = this.categoriesCount.find(k => k.id === e.id);
                return {
                    ...e,
                    count: obj ? obj.count : 0
                };
            });
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
        this.valueChange.emit({
            state: state.id,
            deleted: false,
            folder: null,
            stateName: state.name
        });
    }

    setCurrentFolder(folder: any) {
        this.deletedStateEnabled = false;
        this.currentFolder = folder;
        this.valueChange.emit({
            state: null,
            deleted: false,
            folder: folder.id,
            stateName: folder.name
        });
    }

    setCurrentCategory(category: any) {
        this.deletedStateEnabled = false;
        this.currentCategory = category;
        this.valueChange.emit({ state: null, deleted: false, folder: null,
            stateName: this.currentCategory.name, category: this.currentCategory.id });
    }

    isItemActive(state: string) {
        return this.currentState && this.currentState.id === state;
    }

    isFolderActive(folder: string) {
        return this.currentFolder && this.currentFolder.id === folder;
    }

    isCategoryActive(category: any) {
        return this.currentCategory && this.currentCategory.id === category.id;
    }

    isDeleteActive() {
        return this.deletedStateEnabled;
    }

    changeViewFn(view: any) {
        this.changeView.emit(view);
    }

    public setShowMenu() {
        const adminFound = this.user.roles.find(element => element === this.ADMIN_ROLE);
        const mediumFound = this.user.roles.find(element => element === this.MEDIUM_ROLE);

        this.showEditSiteMenu = adminFound !== undefined && mediumFound === undefined;
        this.showMultimediaMenu = adminFound !== undefined;

        return this.showEditSiteMenu;
    }
}

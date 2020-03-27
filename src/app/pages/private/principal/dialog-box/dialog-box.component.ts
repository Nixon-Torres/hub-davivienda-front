import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { AsideFoldersService } from 'src/app/services/aside-folders.service';

export class Folder {
    id: string;
    name: string;
    icon: string;
    author: number;
}

@Component({
    selector: 'app-dialog-box',
    templateUrl: './dialog-box.component.html',
    styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent {
    public folders: any[] = [];
    public folder: any;

    constructor(
        public dialogRef: MatDialogRef<DialogBoxComponent>,
        public dialog: MatDialog,
        public http: HttpService,
        private folderService: AsideFoldersService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.folders = this.data;
        this.cleanFolder();
    }

    onNoClick(input: boolean): void {
        this.dialogRef.close(input);
    }

    onSaveFolder(): void {
        if (!this.folder.name.replace(/(\s)/g, '')) return;
        const path: string = this.folder.id ? `folders/${this.folder.id}` : 'folders';
        const method: string = this.folder.id ? 'patch' : 'post';
        this.http[method]({
            path,
            data: this.folder
        }).subscribe((response: any) => {
            this.folderService.loadFolders();
            if (this.folder.id) {
                for (const keyFolder in this.folders) {
                    if (this.folders[keyFolder].id === this.folder.id) {
                        this.folders[keyFolder] = response.body;
                        break;
                    }
                }
            } else {
                this.folders.push(response.body);
            }

            this.cleanFolder();
        });
    }

    onDeleteFolder(folder: any): void {
        const deleteDialog = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    title: '¿Está seguro que desea Eliminar la carpeta?',
                    subtitle: folder.name
                }
            }
        });
        deleteDialog.afterClosed().subscribe( (data: any)  => {
            if (data) {
                this.http.delete({
                    path: `folders/${folder.id}`
                }).subscribe(() => {
                    this.folders = this.folders.filter((a) => a.id !== folder.id);
                    this.folderService.loadFolders();
                });
            }
        });
    }

    onEditFolder(folder: any): void {
        this.folder = {
            id: folder.id,
            name: folder.name,
            icon: folder.icon
        };
    }

    cleanFolder() {
        this.folder = {
            id: null,
            name: '',
            icon: ' '
        };
    }
}

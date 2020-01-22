import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';

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
        public http: HttpService,
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
        let path: string = this.folder.id ? `folders/${this.folder.id}` : 'folders';
        let method: string = this.folder.id ? 'patch' : 'post';
        this.http[method]({
            path: path,
            data: this.folder
        }).subscribe((response: any) => {
            if (this.folder.id) {
                for (let keyFolder in this.folders) {
                    if (this.folders[keyFolder].id == this.folder.id) {
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
        let confirmDialog = confirm('Esta seguro que desea eliminar la carpeta');
        if (!confirmDialog) return;
        this.http.delete({
            path: `folders/${folder.id}`
        }).subscribe(() => {
            this.folders = this.folders.filter((a) => a.id !== folder.id);
        });
    }

    onEditFolder(folder: any): void {
        this.folder = {
            id: folder.id,
            name: folder.name,
            icon: folder.icon
        }
    }

    cleanFolder() {
        this.folder = {
            id: null,
            name: '',
            icon: ' '
        }
    }
}

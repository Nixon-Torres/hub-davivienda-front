import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import {HttpService} from '../../../../services/http.service';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-tags-dialog',
    templateUrl: './tags-dialog.component.html',
    styleUrls: ['./tags-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TagsDialogComponent implements OnInit {
    public tagsList: Array<string> = [];
    public removable: boolean;
    public selectable: boolean;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    public isEditing: boolean;
    public input = '';
    public isListEmpty: boolean;

    constructor(
        public dialogRef: MatDialogRef<TagsDialogComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpService
    ) {
        console.log(this.data.categotyId);
        this.selectable = false;
        this.removable = true;
    }

    ngOnInit() {
        this.onLoadTags();
    }

    private onLoadTags(): void {
        this.http.get({
            path: `categories/${this.data.categoryId}`
        }).subscribe((resp: any) => {
            if (resp && resp.body && resp.body.tags) {
                this.tagsList = resp.body.tags;
                this.isListEmpty = this.tagsList.length === 0;
                this.isEditing = this.tagsList.length > 0;
            }
        });
    }

    public closeDialog(): void {
        this.dialogRef.close();
    }

    public listLengthIsValid(): boolean {
        return this.tagsList.length < 3;
    }

    public add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim() && this.listLengthIsValid()) {
            this.tagsList.push(value.trim());
        }
        if (input) {
            input.value = '';
        }
    }

    public remove(tag: string): void {
        const index = this.tagsList.indexOf(tag);
        setTimeout(() => {
            this.isListEmpty = this.tagsList.length === 0;
            this.input = '';
        }, 0);
        if (index >= 0) {
            this.tagsList.splice(index, 1);
        }
    }

    public onSaveTags(): void {
        this.http.patch({
            path: `categories/${this.data.categoryId}`,
            data: {
                tags: this.tagsList
            }
        }).subscribe((resp: any) => {
            if (resp) {
                this.openConfirmationDialog();
            }
        });
    }

    private openConfirmationDialog(): void {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Los TAGS fueron agregados correctamente'
                }
            }
        });
        dialog.afterClosed().subscribe(() => {
            this.closeDialog();
        });
    }
}

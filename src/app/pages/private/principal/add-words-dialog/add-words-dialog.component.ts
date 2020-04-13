import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';

import {HttpService} from '../../../../services/http.service';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {AsideFoldersService} from 'src/app/services/aside-folders.service';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {timer} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export class Folder {
    id: string;
    name: string;
    icon: string;
    author: number;
}

@Component({
    selector: 'app-add-words-dialog',
    templateUrl: './add-words-dialog.component.html',
    styleUrls: ['./add-words-dialog.component.scss']
})
export class AddWordsDialogComponent {
    public AddWordGroup: FormGroup;
    public titleInput: FormControl;

    public title: string;
    public description: string;
    public source: string;

    constructor(
        public dialogRef: MatDialogRef<AddWordsDialogComponent>,
        public dialog: MatDialog,
        public http: HttpService,
        private folderService: AsideFoldersService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.titleInput = new FormControl('', {
            validators: [Validators.required],
            asyncValidators: [wordAsyncValidator(this.http)]
        });
        this.AddWordGroup = new FormGroup({
            title: this.titleInput,
            description: new FormControl('', Validators.required),
            source: new FormControl('', Validators.required),
        });
    }

    onNoClick(input: boolean): void {
        this.dialogRef.close(input);
    }

    onSaveWord() {
        if (this.AddWordGroup.status === 'INVALID') {
            console.log('invalid!');
            return;
        }
        this.http.post({
            path: 'glossaries',
            data: {
                word: this.title,
                meaning: this.description,
                source: this.source
            }
        }).subscribe((res) => {
            this.dialogRef.close({});
        });
    }
}

export const wordAsyncValidator =
    (http: HttpService, time: number = 500) => {
        return (input: FormControl) => {
            return timer(time).pipe(
                switchMap(() => http.get({
                        path: 'glossaries',
                        data: {
                            where: {
                                word: {
                                    like: input.value, options: 'i'
                                }
                            }
                        },
                        encode: true
                    }),
                    (num, res) => {
                        const data = res.body as any;
                        return data && data.length === 0 ? null : {wordExist: true};
                    }
                ));
        };
    };

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';
import {PreviewDialogComponent} from '../preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-revision-modal',
  templateUrl: './revision-modal.component.html',
  styleUrls: ['./revision-modal.component.scss']
})
export class RevisionModalComponent implements OnInit {

    public users: Array<object>;
    public reviewers: Array<object> = [];
    public selectIsVisible: boolean;

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // this.report.id = this.data.reportId;
    }

    ngOnInit() {
        this.users = this.data.users;
        this.selectIsVisible = true;
    }
    
    closeDialog(): void {
        this.dialogRef.close();
    }

    openModalSendReview() {
        this.dialogRef.close(this.reviewers);
    }

    onSelectUser(user): void {
        this.removeUser(user.id, this.users, 'user');
        this.selectIsVisible = false;
    }

    removeUser(id: string, list:Array<object>, state?: string) {
        let found;
        for (const key in list) {
            if (list.hasOwnProperty(key)) {
                const element = list[key];
                if(element['id'] === id) {
                    found = key;
                }
            }
        }
        const removed = list.splice(found, 1)[0];
        if(state) {
            this.reviewers.push(removed);
        } else {
            this.users = [...this.users, removed];
        }
    }
}

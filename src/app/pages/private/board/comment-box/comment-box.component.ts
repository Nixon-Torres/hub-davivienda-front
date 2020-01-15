import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';

import { Comment } from './comment-box.model';


@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.scss']
})
export class CommentBoxComponent implements OnInit {
    @Input() reportId: string;
    public user: any = {};
    public comment: Comment;
    public list: any = {
        comments: []
    };

    constructor(
        private http: HttpService,
        private auth: AuthService
    ) {
        this.comment = {
            'id': null,
            'reportId': this.reportId,
            'text': ''
        }
        this.user = this.auth.getUserData();
    }

    ngOnInit() {
    }

    loadComments() {
        this.http.get({
            'path': 'comments/'
        }).subscribe(
            (response) => {
                this.list.comments = response.body;
            }
        );
    }

    sendComment() {
        this.http.post({
            'path': 'comments/',
            'data': this.comment
        }).subscribe(
            () => {

            },
            () => {
                alert('Oops!!! \nAlgo Salio Mal.');
            }
        );
    }
}

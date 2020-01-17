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
    @Input('reportId') private reportId: string;
    public user: any = {};
    public comment: Comment = {
        'id': null,
        'reportId': null,
        'text': ''
    };
    public list: any = {
        comments: []
    };

    constructor(
        private http: HttpService,
        private auth: AuthService
    ) {
        this.user = this.auth.getUserData();
        console.log(this.user);
    }

    ngOnInit() {
        this.comment.reportId = this.reportId;
        this.loadComments();
    }

    loadComments() {
        var filter = {
            include: ['user'],
            where: {reportId: this.reportId}
        };
        this.http.get({
            path: `comments?filter=${JSON.stringify(filter)}`
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
                this.comment.text = '';
                this.loadComments();
            },
            () => {
                alert('Oops!!! \nAlgo Salio Mal.');
            }
        );
    }
}

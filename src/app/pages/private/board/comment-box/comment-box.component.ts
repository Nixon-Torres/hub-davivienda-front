import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';

import { Comment } from './comment-box.model';
import * as $ from "jquery/dist/jquery";

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

        $(document)
        .one('focus.autoExpand', 'textarea.autoExpand', function(){
            console.log(this);
            var savedValue = this.value;
            this.value = '';
            this.baseScrollHeight = this.scrollHeight;
            this.value = savedValue;
        })
        .on('input.autoExpand', 'textarea.autoExpand', function(){
            var minRows = this.getAttribute('data-min-rows')|0, rows;
            this.rows = minRows;
            rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
            this.rows = minRows + rows;
        });
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

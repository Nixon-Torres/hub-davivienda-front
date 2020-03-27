import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';

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
    @Output() propagate = new EventEmitter<string>();
    @Output() unresolved = new EventEmitter<object>();

    public user: any = {};
    public comment: Comment = {
        id: null,
        reportId: null,
        text: '',
        resolved: false
    };
    public list: any = {
        comments: []
    };

    constructor(
        private http: HttpService,
        private auth: AuthService
    ) {
        this.user = this.auth.getUserData();
    }

    ngOnInit() {
        this.comment.reportId = this.reportId;
        this.loadComments();

        $('textarea').on('click', function() {
            document.querySelector('textarea').classList.add('expand');
        });
    }

    loadComments() {
        var filter = {
            include: ['user'],
            where: {reportId: this.reportId},
            order: 'createdAt ASC'
        };
        this.http.get({
            path: `comments?filter=${JSON.stringify(filter)}`
        }).subscribe(
            (response) => {
                this.list.comments = response.body;
                this.unresolved.emit(this.hasUnresolvedComments(this.list.comments));
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
                this.hideCommentForm();
            },
            () => {
                alert('Oops!!! \nAlgo Salio Mal.');
            }
        );
    }

    /** Delete a report comment from DOM and database
    *
    * @param { idComment }
    */
    deleteComment(idComment) {
        this.http.delete({
            'path': `comments/${idComment}`,
            'data': this.comment
        }).subscribe(
            (response) => {
                if (response.ok) {
                    var comment = document.getElementById(idComment);
                    comment.className += " deleted";
                    setTimeout(function() {
                        comment.remove();
                    }, 500);
                } else {
                    alert('Oops!!! \nAlgo Salio Mal.');
                }
            }
        );
    }

    displayCommentForm() {
        document.querySelector('.add-action').classList.add('hide');
        document.querySelector('.comment-form').classList.remove('hide');
    }

    hideCommentForm() {
        document.querySelector('.comment-form').classList.add('hide');
        document.querySelector('.add-action').classList.remove('hide');
        document.querySelector('textarea').classList.remove('expand');
    }

    hideComments() {
        this.propagate.emit();
    }

    resolveComment(comment: Comment) {
        this.http.patch({
            path: `comments/${comment.id}`,
            data: {
                resolved: true,
                resolverId: this.user.id
            }
        }).subscribe(
            (resp: any) => {
                comment.resolved = true;
                this.loadComments();
            }
        );
    }

    hasUnresolvedComments(commentsList: any): object {
        let unresolvedCount = commentsList.filter(comment => comment.resolved === false).length;
        return {
            count: unresolvedCount,
            state: unresolvedCount > 0 ? true : false
        }
    }
}

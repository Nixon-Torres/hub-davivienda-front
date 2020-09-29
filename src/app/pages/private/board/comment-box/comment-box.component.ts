import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation  } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';
import { Comment } from './comment-box.model';

@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CommentBoxComponent implements OnInit {
    @Input('showHeader') showHeader = true;
    @Input('report') private report: any;
    @Output() propagate = new EventEmitter<string>();
    @Output() unresolved = new EventEmitter<object>();
    
    flagAdd: boolean = false;
    expandStyle: string = '';
    
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
        this.auth.user.subscribe((user) => {
            this.user = user;
        });
    }

    ngOnInit() {
        this.comment.reportId = this.report.id;
        this.loadComments();
    }

    expandArea(): void {
        this.expandStyle = 'expand';
    }

    loadComments() {
        const filter = {
            include: ['user'],
            where: {reportId: this.report.id},
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
            path: 'comments/',
            data: this.comment
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
    * @param { idComment }
    */
    deleteComment(idComment) {
        this.http.delete({
            path: `comments/${idComment}`,
            data: this.comment
        }).subscribe(
            (response) => {
                if (response.ok) {
                    const comment = document.getElementById(idComment);
                    comment.className += ' deleted';
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
        this.flagAdd = true;
    }

    hideCommentForm() {
        this.flagAdd = false;
        this.expandStyle = '';
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
        const unresolvedCount = commentsList.filter(comment => comment.resolved === false).length;
        return {
            count: unresolvedCount,
            state: unresolvedCount > 0 ? true : false
        };
    }
}

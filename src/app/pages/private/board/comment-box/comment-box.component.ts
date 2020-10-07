import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewEncapsulation,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { HttpService } from '../../../../services/http.service';
import { Comment } from './comment-box.model';
import {switchMap} from 'rxjs/operators';
import {of} from 'rxjs';

const TYPE_GENERAL = 'GENERAL';
const TYPE_THREAD = 'THREAD';

@Component({
    selector: 'app-comment-box',
    templateUrl: './comment-box.component.html',
    styleUrls: ['./comment-box.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CommentBoxComponent implements OnInit, OnChanges {
    @Input('showHeader') showHeader = true;
    @Input('report') private report: any;
    @Input('textSelection') private textSelection: any = null;
    _threadId: string|number;
    @Input()
    set threadId(val: string|number) {
        this.threadIdChange.emit(val);
        this._threadId = val;
    }
    get threadId() : string|number {
        return this._threadId;
    }
    @Output() propagate = new EventEmitter<string>();
    @Output() unresolved = new EventEmitter<object>();
    @Output()
    threadIdChange: EventEmitter<string|number> = new EventEmitter<string|number>();
    @Output() commentAction: EventEmitter<object> = new EventEmitter<object>();

    flagAdd: boolean = false;
    flagAddChild: boolean = false;
    expandStyle: string = '';
    switchState: boolean;
    replyIdx: number = -1;
    thread: any = null;

    public user: any = {};
    public comment: Comment = {
        id: null,
        reportId: null,
        text: '',
        resolved: false,
        type: TYPE_GENERAL,
        threadId: null,
        textSelection: null,
        parentId: null,
    };
    public list: any = {
        comments: []
    };


    constructor(
        private http: HttpService,
        private auth: AuthService
    ) {
        this.threadId = null;
        this.auth.user.subscribe((user) => {
            this.user = user;
        });
    }

    ngOnInit() {
        this.comment.reportId = this.report.id;
        this.switchState = false;
        this.loadComments();
    }

    expandArea(): void {
        this.expandStyle = 'expand';
    }

    loadComments() {
        let where = {
            reportId: this.report.id,
            type: !!!this.threadId ? TYPE_GENERAL : TYPE_THREAD,
            parentId: null,
        };

        let include:Array<any> = [
            'user',
            {
                relation: 'children',
                scope: {
                    order: 'createdAt ASC',
                }
            }];

        if (!!this.threadId) {
            where['threadId'] = this.threadId;
        }

        const filter = {
            include,
            where,
            order: 'createdAt ASC'
        };
        this.http.get({
            path: `comments?filter=${JSON.stringify(filter)}`
        }).subscribe(
            (response) => {
                this.hideCommentForm();
                this.hideChildCommentForm();
                this.list.comments = response.body;
                this.unresolved.emit(this.hasUnresolvedComments(this.list.comments));
            }
        );
    }

    sendComment(parentId) {
        this.comment.textSelection = this.textSelection;
        this.comment.parentId = parentId;
        this.http.post({
            path: 'comments/',
            data: this.comment
        }).subscribe(
            (response) => {
                if (this.threadId === 'CREATE_NEW')
                    this.threadId = response.body['threadId'];
                this.comment.text = '';
                this.loadComments();
                this.commentAction.emit({
                    action: 'created',
                });
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
        const self = this;
        this.http.delete({
            path: `comments/${idComment}`,
            data: this.comment
        }).subscribe(
            (response) => {
                if (response.ok) {
                    const comment = document.getElementById(idComment);
                    comment.className += ' deleted';
                    setTimeout(function() {
                        if (idComment === self.threadId) {
                            self.threadId = null;
                            self.loadComments();
                            self.commentAction.emit({
                                action: 'deleted',
                                id: idComment
                            });
                        } else {
                            comment.remove();
                        }
                    }, 500);
                } else {
                    alert('Oops!!! \nAlgo Salio Mal.');
                }
            }
        );
    }

    displayCommentForm() {
        this.hideChildCommentForm();
        this.flagAdd = true;
    }

    displayChildrenCommentForm(index) {
        this.hideCommentForm();
        this.flagAddChild = true;
        this.replyIdx = index;
    }

    hideCommentForm() {
        this.flagAdd = false;
        this.expandStyle = '';
    }

    hideChildCommentForm() {
        this.flagAddChild = false;
        this.replyIdx = -1;
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
        }).pipe(
            switchMap((resp: any) => {
                if (!!!this.threadId || this.threadId === 'CREATE_NEW') return of(null);
                const filter = {
                    resolved: false,
                };
                return this.http.get({
                    path: `commentThreads/${this.threadId}/comments/count?where=${JSON.stringify(filter)}`,
                });
            }))
            .subscribe(
            (resp: any) => {
                if (resp.body && resp.body.hasOwnProperty('count') &&
                    resp.body.count === 0) {
                    this.resolveThread();
                }
                comment.resolved = true;
                this.loadComments();
                this.commentAction.emit({
                    action: 'resolved',
                    id: comment.id
                });
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

    ngOnChanges(changes: SimpleChanges) {
        if (changes && changes.hasOwnProperty('threadId')) {
            this.comment.type = !!!this.threadId ? TYPE_GENERAL : TYPE_THREAD;
            this.comment.threadId = !!!this.threadId ? null : String(this.threadId);
            this.switchState = !!this.threadId;
            this.loadThread();
            if (this.threadId === 'CREATE_NEW') {
                this.comment.threadId = null;
                this.list.comments = [];
                this.displayCommentForm();
            } else {
                this.loadComments();
            }
        }
    }

    showResolveButton(index:number): boolean {
        return !!!this.threadId || (index === 0 || index === (this.list.comments.length - 1));
    }

    switchToggled() {
        if (!this.switchState)
          this.threadId = null;
        else {
            let where = {
                reportId: this.report.id,
                threadId: {neq: null},
                resolved: false,
            };

            const filter = {
                limit: 1,
                where,
                order: 'updatedAt DESC'
            };
            this.http.get({
                path: `comments?filter=${JSON.stringify(filter)}`
            }).subscribe(
                (response) => {
                    if (response && response.body &&
                        Array.isArray(response.body) && response.body.length) {
                        this.threadId = response.body[0].threadId;
                    }
                }
            );
        }
    }

    collapseChildren(comment) {
        comment.collapse = !!!comment.collapse;
    }

    getChildrenNumberLabel(comment) {
        if (comment.children.length === 0)
            return '';
        if (comment.children.length === 1)
            return '1 respuesta';
        else
            return String(comment.children.length) + ' respuestas';
    }

    resolveThread() {
        if (!!!this.threadId) return;
        this.http.patch({
            path: `commentThreads/${this.threadId}`,
            data: {
                resolved: true,
                resolverId: this.user.id
            }
        }).subscribe(
            (resp: any) => {
                this.thread.resolved = true;
                this.loadComments();
                this.commentAction.emit({
                    action: 'resolved',
                    id: this.threadId,
                });
            }
        );
    }

    loadThread() {
        if (!!!this.threadId || this.threadId === 'CREATE_NEW') {
            this.thread = null;
            return;
        }

        this.http.get({
            path: `commentThreads/${this.threadId}`,
        }).subscribe(
            (resp: any) => {
                this.thread = resp.body;
            },
            error => {
                this.thread = null;
            });
    }
}

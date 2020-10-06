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
    expandStyle: string = '';
    switchState: boolean;

    public user: any = {};
    public comment: Comment = {
        id: null,
        reportId: null,
        text: '',
        resolved: false,
        type: TYPE_GENERAL,
        threadId: null,
        textSelection: null,
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
        };

        let include:Array<any> = ['user'];

        if (!!this.threadId) {
            where['id'] = this.threadId;
            include.push({
                relation: 'children',
                scope: {
                    order: 'createdAt ASC',
                }
            });
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
                this.list.comments = response.body;
                if (this.list.comments.length > 0 && !!this.threadId) {
                    const children = this.list.comments[0].children || [];
                    delete this.list.comments[0].children;
                    this.list.comments = this.list.comments.concat(children);
                }
                this.unresolved.emit(this.hasUnresolvedComments(this.list.comments));
            }
        );
    }

    sendComment() {
        this.comment.textSelection = this.textSelection;
        this.http.post({
            path: 'comments/',
            data: this.comment
        }).subscribe(
            (response) => {
                if (this.threadId === 'CREATE_NEW')
                    this.threadId = response.body['id'];
                this.comment.text = '';
                this.loadComments();
                this.hideCommentForm();
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
            path: `comments/${!!this.threadId ? this.threadId : comment.id}`,
            data: {
                resolved: true,
                resolverId: this.user.id
            }
        }).subscribe(
            (resp: any) => {
                comment.resolved = true;
                this.threadId = null;
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
    }
}

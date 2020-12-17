import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../../../../services/http.service';

@Component({
  selector: 'app-mobile-comment-view',
  templateUrl: './mobile-comment-view.component.html',
  styleUrls: ['./mobile-comment-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MobileCommentViewComponent implements OnInit {
    @Input() report: any;
    @Output() changeView = new EventEmitter();
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
    @Output()
    threadIdChange: EventEmitter<string|number> = new EventEmitter<string|number>();
    @Output() commentAction: EventEmitter<object> = new EventEmitter<object>();
    constructor(
    ) { }

    back() {
        this.changeView.emit({
            mobile: true,
            report: this.report,
            comment: false,
        });
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }
    }

    closeDialog(): void {
    }

    onCommentAction(evt) {
        this.commentAction.emit(evt);
    }
}

import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {HttpService} from '../../../../services/http.service';

@Component({
  selector: 'app-mobile-comment-view',
  templateUrl: './mobile-comment-view.component.html',
  styleUrls: ['./mobile-comment-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MobileCommentViewComponent implements OnInit {
    @Input() reportId: string;
    @Input() state: string;
    @Output() changeView = new EventEmitter();

    public report: any = {
        id: null,
        styles: '',
        content: ''
    };

    constructor(
        private http: HttpService,
    ) {
    }

    back() {
        this.changeView.emit({
            mobile: true,
            reportId: this.reportId,
            comment: false,
        });
    }

    ngOnInit() {
        this.report.id = this.reportId;
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        this.http.get({
            path: `reports/${this.report.id}`
        }).subscribe((response: any) => {
            this.report.content = response.body.content ? response.body.content : '';
        });
    }

    closeDialog(): void {
    }

    openCommentDialog(idReport: string): void {
        this.changeView.emit({
            mobile: true,
            reportId: idReport,
            comment: true
        });
    }

}

import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-mobile-detail-view',
  templateUrl: './mobile-detail-view.component.html',
  styleUrls: ['./mobile-detail-view.component.scss']
})
export class MobileDetailViewComponent implements OnInit {
    @Input() reportId: string;
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
            reports: true
        });
    }

    ngOnInit() {
        this.report.id = this.reportId;
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        // document.querySelector('.mat-dialog-container').classList.add('not-scrollable');

        this.http.get({
            path: `reports/view?id=${this.report.id}`
        }).subscribe((response: any) => {
            this.report.styles = response.body.view.styles ? response.body.view.styles : '';
            this.report.content = response.body.view.content ? response.body.view.content : '';
            this.loadReport();
        });
    }

    public loadReport(): void {
        const iframe = document.getElementById('previewFrame');
        const doc = (iframe as HTMLIFrameElement).contentWindow.document;
        const regex = new RegExp('href="\/reports\/' + this.report.id, 'gi');
        this.report.content = this.report.content.replace(
            regex, () => {
                return `href="`;
            });
        const reportTpl = `
    		<html>
    			<head>
    				<style type="text/css">${this.report.styles}</style>
    			</head>
    			<body>${this.report.content}</body>
    		</html>
		`;

        doc.open();
        doc.write(reportTpl);
        doc.close();
    }

    closeDialog(): void {
    }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../services/http.service';


@Component({
    selector: 'app-preview-dialog',
    templateUrl: './preview-dialog.component.html',
    styleUrls: ['./preview-dialog.component.scss']
})

export class PreviewDialogComponent implements OnInit {
    public report: any = {
        id: null,
        styles: '',
        content: ''
    };

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.report.id = this.data.reportId;
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        document.querySelector('.mat-dialog-container').classList.add('not-scrollable');

        this.http.get({
            'path': `reports/view?id=${this.report.id}`
        }).subscribe((response: any) => {
            console.group('Report');
            console.log(response);
            console.groupEnd();
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
        this.dialogRef.close();
    }

}

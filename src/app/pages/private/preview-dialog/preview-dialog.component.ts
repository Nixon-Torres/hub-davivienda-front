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
        this.report.content = this.data.content;
        this.report.styles = this.data.styles;
    }

    ngOnInit() {

        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        document.querySelector('.mat-dialog-container').classList.add('not-scrollable')
        console.log(document.querySelector('.mat-dialog-container'));

        if (this.report.content && this.report.styles) {
            this.loadReport();
        } else {
            this.http.get({
                'path': `reports/${this.report.id}`
            }).subscribe((response: any) => {
                this.report.styles = response.body.styles ? response.body.styles : '';
                this.report.content = response.body.content ? response.body.content : '';
                this.loadReport();
            });
        }
    }

    public loadReport(): void {
        let iframe = document.getElementById('previewFrame');
        let doc = (<HTMLIFrameElement>iframe).contentWindow.document;
        let reportTpl = `
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

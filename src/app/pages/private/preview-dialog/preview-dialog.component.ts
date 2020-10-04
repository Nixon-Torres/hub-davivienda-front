import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../services/http.service';
import {
    CustomClickEvent,
    TextSelectEvent,
} from 'src/app/directives/text-select.directive';
import { DomSanitizer } from '@angular/platform-browser';

const COMMENT_ATTRIBUTE_NAME = 'threadId';

@Component({
    selector: 'app-preview-dialog',
    templateUrl: './preview-dialog.component.html',
    styleUrls: ['./preview-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PreviewDialogComponent implements OnInit {
    public report: any = {
        id: null,
        styles: '',
        content: ''
    };

    public myhtml: any = '';

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sanitizer: DomSanitizer,
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
            //this.myhtml = response.body.view.content;
            //this.mystyle = this.sanitizer.bypassSecurityTrustStyle(response.body.view.styles);
            this.myhtml = this.sanitizer.bypassSecurityTrustHtml(response.body.view.content);
            //this.loadReport();
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

    public renderRectangles(event: TextSelectEvent): void {

        console.group("Text Select Event");
        console.log("Text:", event.text);
        console.log("Viewport Rectangle:", event.viewportRectangle);
        console.log("Host Rectangle:", event.hostRectangle);
        console.log("Selection:", event.selection);
        console.groupEnd();

        // If a new selection has been created, the viewport and host rectangles will
        // exist. Or, if a selection is being removed, the rectangles will be null.
        /*if (event.hostRectangle) {

            this.hostRectangle = event.hostRectangle;
            this.selectedText = event.text;

        } else {

            this.hostRectangle = null;
            this.selectedText = "";

        }*/
    }

    public contentOnClick(event: CustomClickEvent): void {
        if (event.target.attributes[COMMENT_ATTRIBUTE_NAME])
            console.log('Test', event.target.attributes[COMMENT_ATTRIBUTE_NAME].value);
    }
}

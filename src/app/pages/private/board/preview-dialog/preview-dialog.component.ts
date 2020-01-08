import { Component, OnInit, Inject } from '@angular/core';
import { HttpService } from '../../../../services/http.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss']
})

export class PreviewDialogComponent implements OnInit {

	public report: any = {
		"id": null,
        "styles": "",
        "content": ""
    };

  	constructor(
  		public dialogRef: MatDialogRef<PreviewDialogComponent>,
  		private http: HttpService,
  		@Inject(MAT_DIALOG_DATA) public data: any
  	) {
  		this.report.id = this.data.reportId;
  	}

  	ngOnInit() {
  		this.http.get({
            'path': 'reports/' + this.report.id
        }).subscribe((response: any) => {
            this.report.styles = response.body.styles;
            this.report.content = response.body.content;
            this.loadReport();
        });
  	}

  	public loadReport(): void {

		let reportTpl = `
		<html>
			<head>
				<style type="text/css">` + this.report.styles + `</style>
			</head>
			<body>` + this.report.content + `</body>
		</html>
		`;

		let iframe = document.getElementById('previewFrame');
		let doc = (<HTMLIFrameElement> iframe).contentWindow.document;
		doc.open();
		doc.write(reportTpl);
		doc.close();
    }

    closeDialog(): void {
		this.dialogRef.close();
	}

}

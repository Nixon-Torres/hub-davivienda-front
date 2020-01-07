import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss']
})

export class PreviewDialogComponent implements OnInit {

	public report: any = {
        "styles": "",
        "content": ""
    };

  	constructor(
  		public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private activatedRoute: ActivatedRoute,
  		private http: HttpService
  	) { }

  	ngOnInit() {

  	}

	ngAfterViewInit() {
		console.log("1");
		this.activatedRoute.paramMap.subscribe((params: any) => {
		console.log("2", params.get("id"));
            if (params.get("id")) {
                this.report.id = params.get("id");
                this.loadReport(this.report.id);
            }
        });

		console.log("this: ", this.report);

		let tplStyles = `
		h1, p {
            margin: 10px 40px;
            font-family: Helvetica;
        }
        h1 { color: red; }
		`;

		let tplContent = `
		<h1>Titulo de prueba</h1>
		<p>Esta es una descripcion</p>
		`;

		let reportTpl = `
		<html>
			<head>
				<style type="text/css">` + tplStyles + `</style>
			</head>
			<body>` + tplContent + `</body>
		</html>
		`;

		let iframe = document.getElementById('previewFrame');
		let doc = (<HTMLIFrameElement> iframe).contentWindow.document;
		doc.open();
		doc.write(reportTpl);
		doc.close();
    }

  	public loadReport(idReport: string): void {

  		console.log("idReport: ", idReport);

        this.http.get({
            'path': 'reports/' + idReport
        }).subscribe((response: any) => {

        	console.log("response: ", response);

            response.body.styles = `
                section {
                    margin: 10px 40px;
                    font-family: Helvetica;
                }

                .box {
                    color: white;
                    padding: 20px 40px;
                    font-family: Helvetica;
                    background-color: black;
                }
            `;

            this.report.id = response.body.id;
            this.report.styles = response.body.styles;
            this.report.content = response.body.content;
        });
    }

    closeDialog(): void {
		this.dialogRef.close();
	}

}

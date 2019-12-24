import { NgModule, Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
	selector: 'app-create-report-dialog',
	templateUrl: './create-report-dialog.component.html',
	styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<CreateReportDialogComponent>){}

		onNoClick(): void {
			this.dialogRef.close();
		}

	ngOnInit() {

	}

}

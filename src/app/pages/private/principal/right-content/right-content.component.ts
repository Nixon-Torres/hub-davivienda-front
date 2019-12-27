
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';


@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {

	constructor(public dialog: MatDialog) { }

	openDialog(): void {
		const dialogRef = this.dialog.open(CreateReportDialogComponent, {
			width: '1500px'
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log('The dialog was closed');
		});
	} 	

	ngOnInit() {
		
	}

}

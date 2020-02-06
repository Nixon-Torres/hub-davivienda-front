import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-highlight-dialog',
  templateUrl: './highlight-dialog.component.html',
  styleUrls: ['./highlight-dialog.component.scss']
})

export class HighlightDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<HighlightDialogComponent>,
		// @Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

}

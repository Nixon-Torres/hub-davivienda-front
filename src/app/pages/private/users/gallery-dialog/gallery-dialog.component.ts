import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-gallery-dialog',
  templateUrl: './gallery-dialog.component.html',
  styleUrls: ['./gallery-dialog.component.scss']
})
export class GalleryDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<GalleryDialogComponent>,
		public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {
	}

	onNoClick(): boolean {
	    this.dialogRef.close();
	    return false;
	}

}

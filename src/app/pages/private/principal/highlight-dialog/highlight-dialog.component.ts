
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GalleryDialogComponent } from '../../gallery-dialog/gallery-dialog.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-highlight-dialog',
  templateUrl: './highlight-dialog.component.html',
  styleUrls: ['./highlight-dialog.component.scss']
})

export class HighlightDialogComponent implements OnInit {

	public sectionSelect: String = '';
	public pictureSelect: boolean = false;
	public storageBase: String =  environment.STORAGE_FILES;
	public photo: String = '';
	public imageSelected: boolean = false; 

	constructor(
		public dialog: MatDialog,
		public dialogRef: MatDialogRef<HighlightDialogComponent>,
		// @Inject(MAT_DIALOG_DATA) public data: any
	) { }

	ngOnInit() {
	}

	onCheckSection(section) {
		this.sectionSelect = section;
		this.pictureSelect = true; 
	}

	isActive(section): boolean {
		return this.sectionSelect === section ? true : false; 
	}

	onNoClick(input: boolean): void {
        this.dialogRef.close(input);
    }


    public openGallery(): void {
    	const dialogRef = this.dialog.open(GalleryDialogComponent, {
    		width: '900px',
    		height: '500px'
    	});

    	dialogRef.afterClosed().subscribe((result : any) => {
    		if (result != undefined){
    			this.photo = result.data;
    			this.imageSelected = true;
    			this.dialogRef.updateSize('760px','900px');
    		}	 		
    	});

    	this.dialogRef.updateSize('760px','500px');

    }

    public onRemoveImage(): void {
    	this.imageSelected = false;
    	this.photo = '';
    }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-gallery-dialog',
  templateUrl: './gallery-dialog.component.html',
  styleUrls: ['./gallery-dialog.component.scss']
})
export class GalleryDialogComponent implements OnInit {

	public imageForm: FormGroup;

	public list: any = {
		gallery: []
	}

	constructor(
		public dialogRef: MatDialogRef<GalleryDialogComponent>,
		public dialog: MatDialog,
		private formBuilder: FormBuilder,
		private http: HttpService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {
		this.imageForm = this.formBuilder.group({
		    file: ['']
		});
		this.getGalleryImages();		
	}

	onNoClick(): boolean {
	    this.dialogRef.close();
	    return false;
	}

	public onSelectFile(event) {
		if (event.target.files.length > 0) {
		    const file = event.target.files[0];
		    this.imageForm.get('file').setValue(file);
		    this.onUploadImage();
		}
	}

	public getGalleryImages() {
		this.http.get({
		    path: 'media'
		}).subscribe((response: any) => {
			if (response.body.name && (response.body.statusCode || response.body.code)) {
				//console.log('error');
			} else  {
				this.list.gallery = response.body;
				console.log(this.list.gallery);
			}
		});
	}	

	public onUploadImage() {
		const formData = new FormData();
		formData.append('types', encodeURI(JSON.stringify(['png','jpg','gif'])));
		formData.append('file', this.imageForm.get('file').value);
		formData.append('key', 'image');

		this.http.post({
		    path: 'media/upload',
		    data: formData
		}).subscribe((response: any) => {
			if (response.body.name && (response.body.statusCode || response.body.code)) {
				alert('error');
			}
			this.list.gallery.unshift(response.body.file);
		});

	}

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GalleryDialogComponent } from '../../gallery-dialog/gallery-dialog.component';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { environment } from '../../../../../environments/environment';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from '../../../../services/auth.service';

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
	public reportId: string = '';
	public reportName: string = '';
	public idImage: string = '';
	public report: any = null;
	public file: any = null;
	public remarkableReports: any = null;

	constructor(
		public dialog: MatDialog,
		public dialogRef: MatDialogRef<HighlightDialogComponent>,
		private http: HttpService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { 
		this.report = data.report;
		// this.reportId = this.data.id,
		// this.reportName = this.data.name  
	}

	ngOnInit() {
		this.getRemarkablesReports(); 
	}

	onCheckSection(section) {
		this.sectionSelect = section;
		this.pictureSelect = true;
	}

	isActive(section): boolean {
		return this.sectionSelect === section ? true : false; 
	}

	onNoClick(input: boolean): void {
		this.dialogRef.close({event:'cancel'});
	}


	public openGallery(): void {
		const dialogRef = this.dialog.open(GalleryDialogComponent, {
			width: '900px',
			height: '500px',
			data: {'name':this.reportName, 'id':this.reportId}
		});

		dialogRef.afterClosed().subscribe((result : any) => {
			if (result != undefined){
				this.photo = result.data.name;
				this.imageSelected = true;
				this.idImage = result.data.id;
				this.file = result.data 
			}
			this.dialogRef.updateSize('760px','900px');
		});

		this.dialogRef.updateSize('760px','500px');
	}


	public onRemoveImage(): void {
		this.imageSelected = false;
		this.photo = '';
	}

	public onSave() {
		let alert  = this.calculateTime();
		this.report.outstanding = true;
		this.report.outstandingArea = this.sectionSelect;

		if (alert) {
			this.save();
		}
		else {
			this.openConfirmation();
		}
	}

	public onUpdateImage() {
		this.file.resourceId = this.report.id;
		this.file.key = 'outstandingImage';

		this.http.patch({
			path: 'media/'+ this.idImage,
			data: this.file
		}).subscribe((response: any) => {
			this.dialogRef.close({event:'save'});
		}, (error: any) => {
			console.error(error);
		});
	}

	public getRemarkablesReports() {

		this.http.get({
			path: 'reports/',
			data: { where: { outstanding: true}},
			encode: true
		}).subscribe((response: any) => {
			this.remarkableReports = response.body; 
		}, (error: any) => {
			console.error(error);
		});

	}

	public calculateTime(): boolean {
		let found = this.remarkableReports.find(element => element.outstandingArea == this.sectionSelect);
		return false;

	}

	public openConfirmation(): void {
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			width: '410px',
			data: {
			title: '¿Esta seguro que desea destacar un nuevo informe?',
			subtitle: '',
			warning: 'Recientemente alguien ha destacado un informe en este módulo',
			confirm: 'Si, destacarlo',
			alert: true,
			showWarning: true 
			}
		});

		dialogRef.afterClosed().subscribe((result : any) => {
			if(result) {
				this.save();
			}
		});
	}

	public save() {
		this.http.put({
			path: 'reports/'+ this.reportId,
			data: this.report
		}).subscribe((response: any) => {
			this.onUpdateImage();
			this.dialogRef.close();
		}, (error: any) => {
			console.error(error);
		});	
	}

}

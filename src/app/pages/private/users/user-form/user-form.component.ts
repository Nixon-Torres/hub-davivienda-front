import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GalleryDialogComponent } from '../gallery-dialog/gallery-dialog.component';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

	@Input() user: any;

	private collapse: boolean = true;
	public imageProfile: String;
	public userForm: FormGroup;
	public save: boolean = false;
	public storageBase: String =  environment.STORAGE_FILES;

	constructor(
		public dialog: MatDialog,
		private formBuilder: FormBuilder,
		private http: HttpService,
		) { }

	ngOnInit() {
		this.userForm = this.formBuilder.group({
			name: new FormControl(this.user.name),
			charge: new FormControl(this.user.charge),
			email: new FormControl(this.user.email),
			leyend: new FormControl(this.user.leyend),
			photo: new FormControl(this.user.photo)
		});

		this.imageProfile = this.user.photo;

	}

	public setHide() {
		this.collapse = this.collapse === false ? true : false;
		this.save = false;
	}

	public  isHide() {
		return this.collapse;
	}

	public openDialog(): void {
		const dialogRef = this.dialog.open(GalleryDialogComponent, {
			width: '900px',
			height: '500px'
		});

		dialogRef.afterClosed().subscribe((result : any) => {
			if (result != undefined) {
				this.imageProfile = this.user.photo;
				this.user.photo = result.data;			
			}
		});

		console.log(this.imageProfile);
	}

	public updateData() {
		this.user.name = this.userForm.get('name').value;
		this.user.charge = this.userForm.get('charge').value;
		this.user.leyend = this.userForm.get('leyend').value
	}

	public onSave() {

		const formData = new FormData();	

		let userData = {
			'name': this.userForm.get('name').value,
			'charge': this.userForm.get('charge').value,
			'leyend': this.userForm.get('leyend').value,
			'photo': this.user.photo,
			'id': this.user.id
		}
		this.http.patch({
		    path: 'users',
		    data: userData
		}).subscribe((response: any) => {
			if (response.body.name && (response.body.statusCode || response.body.code)) {
				console.log('error');
			} else {
				this.save = true;
				this.user.name = this.userForm.get('name').value;
				this.user.charge = this.userForm.get('charge').value,
				this.user.leyend = this.userForm.get('leyend').value
			}
		});
	}

	public onCancel() {
		this.userForm.get('name').setValue(this.user.name);
		this.userForm.get('charge').setValue(this.user.charge);
		this.userForm.get('leyend').setValue(this.user.leyend);
		this.user.photo = this.imageProfile;
	}		


}

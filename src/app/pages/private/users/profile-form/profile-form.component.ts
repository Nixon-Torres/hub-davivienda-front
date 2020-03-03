
import { Component, OnInit, Input } from '@angular/core';
import { UsersService } from '../../../../services/users.service';
import { AuthService } from '../../../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { GalleryDialogComponent } from '../../gallery-dialog/gallery-dialog.component';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

	public user: any = [];
	private userCopy: any = [];
	private imageProfile: any;
	public profileForm: FormGroup;
	public storageBase: string =  environment.STORAGE_FILES;
	public save: boolean = false;


  	constructor(
  		private auth: AuthService,
  		private users: UsersService,
  		public dialog: MatDialog,
  		private formBuilder: FormBuilder,
  		private http: HttpService,
  	) { }

	ngOnInit() {
		this.user = this.auth.getUserData();

		this.profileForm = this.formBuilder.group({
			name: new FormControl(this.user.name),
			charge: new FormControl(this.user.charge),
			email: new FormControl(this.user.email),
			leyend: new FormControl(this.user.leyend),
			photo: new FormControl(this.user.photo)
		});

		this.imageProfile = this.user.photo;
	}

	public setForm() {

	}

	public openDialog(): void {
		const dialogRef = this.dialog.open(GalleryDialogComponent, {
			width: '900px',
			height: '500px'
		});

		dialogRef.afterClosed().subscribe((result : any) => {
			console.log(result);
			if (result != undefined){
				this.imageProfile = this.user.photo;
				this.user.photo = result.data.name;
			}

		});
	}

	public updateDate() {
		this.user.name = this.profileForm.get('name').value;
		this.user.charge = this.profileForm.get('charge').value;
		this.user.leyend = this.profileForm.get('leyend').value;
	}

	public onSave() {
		const formData = new FormData();

		let userData = {
			'name': this.profileForm.get('name').value,
			'charge': this.profileForm.get('charge').value,
			'leyend': this.profileForm.get('leyend').value,
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
				this.auth.reloadUser();
			}
		});
	}

	public onCancel() {
		this.profileForm.get('name').setValue(this.user.name);
		this.profileForm.get('charge').setValue(this.user.charge);
		this.profileForm.get('leyend').setValue(this.user.leyend);
		this.user.photo = this.imageProfile;
	}

}

import {Component, OnInit, Input} from '@angular/core';
import {UsersService} from '../../../../services/users.service';
import {AuthService} from '../../../../services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {GalleryDialogComponent} from '../../gallery-dialog/gallery-dialog.component';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpService} from '../../../../services/http.service';
import {environment} from '../../../../../environments/environment';

@Component({
    selector: 'app-profile-form',
    templateUrl: './profile-form.component.html',
    styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

    public user: any = [];
    public profileImage: any;

    public profileForm: FormGroup;
    public storageBase: string = environment.STORAGE_FILES;
    public save = false;

    constructor(
        private auth: AuthService,
        private users: UsersService,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private http: HttpService,
    ) {
    }

    ngOnInit() {
        this.user = this.auth.getUserData();
        this.getProfileImage();

        this.profileForm = this.formBuilder.group({
            name: new FormControl(this.user.name),
            charge: new FormControl(this.user.charge),
            email: new FormControl(this.user.email),
            leyend: new FormControl(this.user.leyend),
            photo: new FormControl(this.user.photo)
        });
    }

    public getProfileImage() {
        this.http.get({
            path: '/media',
            data: {
                where: {
                    resourceId: this.user.id,
                    key: 'profile-image'
                },
                limit: 1
            },
            encode: true
        }).subscribe((res) => {
            const images = res.body as any;
            if (images && images.length) {
                this.profileImage = images[0];
            }
        });
    }

    public openDialog(): void {
        const dialogRef = this.dialog.open(GalleryDialogComponent, {
            width: '900px',
            height: '500px'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result !== undefined) {
                this.cloneImage(result.data.id, this.user.id, this.profileImage ? this.profileImage.id : null);
            }
        });
    }

    public cloneImage(imageId, resourceId, replaceId) {
        const data: any = {
            resourceId,
            public: false,
            key: 'profile-image'
        };

        if (replaceId) {
            data.replaceId = replaceId;
        }

        this.http.post({
            path: `media/${imageId}/clone`,
            data
        }).subscribe((res) => {
            this.profileImage = res.body as any;
            const files = this.user.files.filter(e => e.key !== 'profile-image');
            files.push(this.profileImage);
            this.user.files = files;
            this.auth.setUser(this.user);
        });
    }

    public updateDate() {
        this.user.name = this.profileForm.get('name').value;
        this.user.charge = this.profileForm.get('charge').value;
        this.user.leyend = this.profileForm.get('leyend').value;
    }

    public onSave() {
        const formData = new FormData();

        const userData = {
            name: this.profileForm.get('name').value,
            charge: this.profileForm.get('charge').value,
            leyend: this.profileForm.get('leyend').value,
            photo: this.user.photo,
            id: this.user.id
        };
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
    }
}

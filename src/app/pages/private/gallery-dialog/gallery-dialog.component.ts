import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {HttpService} from '../../../services/http.service';
import {loopback} from '../../../models/common/loopback.model';
import {environment} from '../../../../environments/environment';
import {AuthService} from '../../../services/auth.service';

@Component({
    selector: 'app-gallery-dialog',
    templateUrl: './gallery-dialog.component.html',
    styleUrls: ['./gallery-dialog.component.scss']
})
export class GalleryDialogComponent implements OnInit {
    public user: any;
    public imageForm: FormGroup;
    public selectImage: any;
    public galleryError = false;
    public deleteImage = false;
    public storageBase: string = environment.STORAGE_FILES;
    public searchForm: FormGroup;

    public list: any = {
        gallery: []
    };

    constructor(
        private auth: AuthService,
        public dialogRef: MatDialogRef<GalleryDialogComponent>,
        public dialog: MatDialog,
        private formBuilder: FormBuilder,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.user = this.auth.getUserData();
    }

    ngOnInit() {
        this.imageForm = this.formBuilder.group({
            file: ['']
        });
        this.getGalleryImages();
        this.searchForm = this.formBuilder.group({
            search: new FormControl('')
        });
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
        const query = new loopback();

        query.filter.where = {
            public: true,
            key: 'image',
            ownerId: this.user.id
        };

        this.http.get({
            path: 'media?filter=',
            data: query.filter
        }).subscribe((response: any) => {
            if (response.body.name && (response.body.statusCode || response.body.code)) {
                // console.log('error');
            } else {
                this.list.gallery = response.body;
            }
        });
    }

    public onUploadImage() {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['png', 'jpg', 'jpeg', 'gif'])));
        formData.append('file', this.imageForm.get('file').value);
        formData.append('key', 'image');
        formData.append('public', 'true');
        formData.append('ownerId', this.user.id);

        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((response: any) => {
            if (response.body.name && (response.body.statusCode || response.body.code)) {
                this.galleryError = true;
            }
            this.galleryError = false;
            this.list.gallery.unshift(response.body.file);
        });
    }

    public onSelectImage(id) {
        this.deleteImage = false;
        this.selectImage = id;
    }

    public isActive(id) {
        return this.selectImage === id;
    }

    public onSave() {
        const found = this.list.gallery.find(element => element.id === this.selectImage);
        this.dialogRef.close({
            event: 'close',
            data: {
                name: found.fileName,
                id: found.id
            }
        });
    }

    public onSearch(event) {
        if (event.key === 'Enter') {
            const query = new loopback();
            const searchValue = this.searchForm.get('search').value;
            query.filter.where = {or: []};
            query.filter.where = {
                public: true,
                key: 'image',
                name: {like: searchValue, options: 'i'},
                ownerId: this.user.id
            };

            this.http.get({
                path: 'media?filter=',
                data: query.filter
            }).subscribe((response: any) => {
                if (response.body.name && (response.body.statusCode || response.body.code)) {
                    // console.log('error');
                } else {
                    this.list.gallery = response.body;
                }
            });
        }
    }

    public onDelete() {
        const found = this.list.gallery.findIndex(element => element.id == this.selectImage);
        if (this.selectImage) {
            this.http.delete({
                path: 'media/' + this.selectImage
            }).subscribe((response: any) => {
                if (response.body.name && (response.body.statusCode || response.body.code)) {
                    // console.log('error');
                } else {
                    this.deleteImage = true;
                    this.list.gallery.splice(found, 1);
                }
            });
        }
    }

}

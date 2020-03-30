import {Component, OnInit, Input} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {HttpService} from 'src/app/services/http.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

    public outstandingForm: FormGroup;
    public formFields: FormGroup;
    public formData: any;
    public outstandingElement: any;
    public currentImage: any;
    public showPanel = false;
    @Input() outstandingKey: string;

    constructor(
        private http: HttpService,
        private formBuilder: FormBuilder,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.onGetOutstanding();
        this.createForm();
        this.outstandingForm = this.formBuilder.group({
            image: [''],
        });
    }

    public onFileSelect(event: any): void {
        if (event.target.files.length > 0) {
            const image = event.target.files[0];
            this.outstandingForm.get('image').setValue(image);
        }
    }

    public onSaveOutstanding(event) {
        event.preventDefault();
        const isUpdated: boolean = this.outstandingElement ? true : false;
        const method: string = isUpdated ? 'patch' : 'post';
        const path: string = isUpdated ? `contents/${this.outstandingElement.id}` : 'contents';
        this.formData = {
            key: this.outstandingKey,
            title: this.f.title.value,
            description: this.f.description.value,
            slug: '',
            params: {
                cta: this.f.ctaText.value,
                link: this.f.link.value,
            }
        };
        this.http[method]({
            path,
            data: this.formData
        }).subscribe((resp: any) => {
            if (resp && resp.body) {

                const img = this.outstandingForm.get('image');
                if (img && img.value !== '') {
                    this.onSaveImage(resp.body.id);
                }

                this.onGetOutstanding();
                this.showDialog(resp.body.title);
            }
        });
    }

    public get f() {
        return this.formFields.controls;
    }

    private createForm() {
        this.formFields = new FormGroup({
            title: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            link: new FormControl('', Validators.required),
            ctaText: new FormControl('', Validators.required)
        });
    }

    private onLoadFormFields(data) {
        this.formFields.setValue({
            title: data.title,
            description: data.description,
            link: data.params.link,
            ctaText: data.params.cta
        });
    }

    private onGetOutstanding() {
        const filter = {
            where: {
                key: this.outstandingKey
            },
            include: ['lastUpdater']
        };
        this.http.get({
            path: 'contents',
            data: filter,
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.outstandingElement = resp.body && resp.body.length ? resp.body[0] : null;
                if (this.outstandingElement && this.outstandingElement.id) {
                    this.onGetImages(this.outstandingElement.id);
                    this.onLoadFormFields(this.outstandingElement);
                }
            }
        });
    }

    private onGetImages(id) {
        const filter = {
            where: {
                resourceId: id,
            }
        };
        this.http.get({
            path: 'media',
            data: filter,
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.currentImage = resp.body && resp.body.length ? resp.body[0] : null;
            }
        });
    }

    private onSaveImage(id) {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg'])));
        formData.append('file', this.outstandingForm.get('image').value);
        formData.append('key', 'outstandignimage');
        formData.append('resourceId', id);
        if (this.currentImage) {
            formData.append('id', this.currentImage.id);
        }
        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((resp: any) => {
            if (resp) {}
        });
    }

    private showDialog(title) {
        this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Se ha publicado exitosamente el destacado del informe',
                    subtitle: title,
                }
            }
        });
    }
}

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';

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
<<<<<<< HEAD
  public currentImage: any;
=======
  public showPanel = false;
>>>>>>> defbe3e82c05c6c5a458f422d0b450826e5098df
  @Input() outstandingKey: string;

  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.onGetOutstanding();
    this.createForm();
    this.outstandingForm = this.formBuilder.group({
      image: [''],
    });
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      console.log('selected imagen', image);
      this.outstandingForm.get('image').setValue(image);
    }
  }

  createForm() {
    this.formFields = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      link: new FormControl('', Validators.required),
      ctaText: new FormControl('', Validators.required)
    });
  }

  get f() { return this.formFields.controls; }

  onSaveOutstanding(event) {
    event.preventDefault();

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
    if (!this.outstandingElement) {
      this.http.post({
        path: 'contents',
        data: this.formData
      }).subscribe((resp: any) => {
        this.onSaveImage(resp.body.id);
        this.onGetOutstanding();
      })
    } else {
      this.http.patch({
        path: `contents/${this.outstandingElement.id}`,
        data: this.formData
      }).subscribe((resp: any) => {
        this.onSaveImage(resp.body.id);
        this.onGetOutstanding();
      });
    }
  }

  onGetOutstanding() {
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
        console.log('ELEMEEEENTTTTTTTTTTTTTTT', this.outstandingElement);
        if (this.outstandingElement && this.outstandingElement.id) {
          this.onGetImages(this.outstandingElement.id);
          this.onLoadFormFields(this.outstandingElement);
        }
      }
    });
  }

  onGetImages(id) {
    const filter = {
      where: {
        resourceId: id,
      }
    }
    this.http.get({
      path: 'media',
      data: filter,
      encode: true
    }).subscribe((resp: any) => {
      console.log('img response', resp);
      if (resp) {
        this.currentImage = resp.body && resp.body.length ? resp.body[0] : null;
        console.log('imaaaaaaaaaaaaage', this.currentImage.id);
      }
    });
  }

  public onLoadFormFields(data) {
    this.formFields.setValue({
      title: data.title,
      description: data.description,
      link: data.link,
      cta: data.cta
    });
  }

  onSaveImage(id) {
    const formData = new FormData();
    formData.append('types', encodeURI(JSON.stringify(['jpg', 'png', 'gif', 'webp', 'jpeg'])));
    formData.append('file', this.outstandingForm.get('image').value);
    formData.append('key', 'outstandignimage');
    formData.append('resourceId', id);
    if (!this.currentImage) {
      this.http.post({
        path: 'media/upload',
        data: formData
      }).subscribe((resp: any) => {
        if (resp) {
          console.log(resp);
        }
      });
    } else {
      console.log('else image', this.currentImage.id);
      console.log(formData);
      this.http.patch({
        path: `media/${this.currentImage.id}`,
        data: formData
      }).subscribe((resp: any) => {
        if (resp) {
          console.log('resp patch',resp);
        }
      });
    }
  }

}

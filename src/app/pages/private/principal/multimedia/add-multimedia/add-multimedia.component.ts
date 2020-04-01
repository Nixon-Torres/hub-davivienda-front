import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../../../../services/http.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../../board/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-add-multimedia',
    templateUrl: './add-multimedia.component.html',
    styleUrls: ['./add-multimedia.component.scss']
})
export class AddMultimediaComponent implements OnInit {
    @Output() isAdding: EventEmitter<boolean>;
    @Input() multimediaType: any;
    @Input() multimediaObj: any;
    public relatedReports: any;
    public multimediaForm: FormGroup;
    public uploadFileForm: FormGroup;
    public tags = [];
    public thumbnailFile: Array<any>;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        public dialog: MatDialog,
        private http: HttpService,
        private formBuilder: FormBuilder
    ) {
        this.isAdding = new EventEmitter<boolean>();
    }

    ngOnInit() {
        this.onInitForms(this.multimediaObj);
        this.onLoadRelatedReports();
        this.thumbnailFile = this.multimediaObj;
        console.log(this.multimediaType);
    }
    private onInitForms(multimediaObj?: any) {
        this.multimediaForm = new FormGroup({
            title: new FormControl(multimediaObj ? multimediaObj.title : ''),
            description: new FormControl(multimediaObj ? multimediaObj.description : ''),
            url: new FormControl(multimediaObj ? multimediaObj.params.url : ''),
            tags: new FormControl(),
            firstRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[0] : null),
            secondRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[1] : null),
            thirdRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[2] : null)
        });

        this.uploadFileForm = this.formBuilder.group({
           thumbnail: ['']
        });
        this.tags = multimediaObj ? multimediaObj.params.tags : [];
    }

    public onLoadRelatedReports() {
        this.http.get({
            path: 'reports',
            data: {
                where: {
                    stateId: '5e068c81d811c55eb40d14d0'
                }
            },
            encode: true
        }).subscribe((resp: any) => {
            if (resp) {
                this.relatedReports = resp.body;
            }
        });
    }

    public loadFile(event: any): void {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.uploadFileForm.get('thumbnail').setValue(file);
        }
    }

    public onSaveThumbnail(resourceId: string): void {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['png', 'jpg', 'gif', 'jpeg'])));
        formData.append('file', this.uploadFileForm.get('thumbnail').value);
        formData.append('key', 'thumbnail');
        formData.append('resourceId', resourceId);
        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((resp: any) => {
            console.log('file resp', resp);
            const state = this.multimediaObj ? 'actualizado' : 'creado';
            const type = this.multimediaType;
            if (resp) {
                this.dialog.open(ConfirmationDialogComponent, {
                    width: '410px',
                    data: {
                        config: {
                            title: `Se ha ${state} exitosamente el ${type.name}`,
                            subtitle: this.multimediaForm.get('title').value
                        }
                    }
                });
            }
        });
    }

    public onSaveMultimedia(): void {
        const method = this.multimediaObj ? 'patch' : 'post';
        const path = this.multimediaObj ? `contents/${this.multimediaObj.id}` : 'contents' ;
        const formControls = this.multimediaForm.controls;
        console.log(this.multimediaForm);
        this.http[method]({
            path,
            data: {
                key: 'multimedia',
                title: formControls.title.value,
                description: formControls.description.value,
                params: {
                    multimediaType: this.multimediaType,
                    url: formControls.url.value,
                    tags: this.tags,
                    relatedReports: [
                        formControls.firstRelated.value,
                        formControls.secondRelated.value,
                        formControls.thirdRelated.value
                    ]
                }
            }
        }).subscribe((resp: any) => {
            console.log(resp);
            if (resp && resp.body) {
                this.onSaveThumbnail(resp.body.id);
            }
        });

    }

    public removeSelected(event) {
        this.relatedReports = this.relatedReports.filter((report: any) =>  report.id !== event.id);
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    public updateView(): void {
        this.isAdding.emit(false);
    }

}

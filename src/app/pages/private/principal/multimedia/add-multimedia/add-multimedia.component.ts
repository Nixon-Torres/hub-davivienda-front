import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpService} from '../../../../../services/http.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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
    public currentFile: any;
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
        this.onLoadCurrentFile();
        this.thumbnailFile = this.multimediaObj;
    }
    private onInitForms(multimediaObj?: any) {
        this.multimediaForm = new FormGroup({
            title: new FormControl(multimediaObj ? multimediaObj.title : '', Validators.required),
            description: new FormControl(multimediaObj ? multimediaObj.description : '', Validators.required),
            url: new FormControl(multimediaObj ? multimediaObj.params.url : '', Validators.required),
            firstRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[0] : null, Validators.required),
            secondRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[1] : null, Validators.required),
            thirdRelated: new FormControl(multimediaObj ? multimediaObj.params.relatedReports[2] : null, Validators.required)
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

    public onLoadCurrentFile(): void {
        if (this.multimediaObj) {
            this.http.get({
                path: 'media',
                data: {
                    where: {
                        resourceId: this.multimediaObj.id
                    }
                },
                encode: true
            }).subscribe((resp: any) => {
                if (resp) {
                   this.currentFile = resp.body[0];
                }
                console.log('current file', resp);
            });
        }
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
        if (this.currentFile) {
            formData.append('id', this.currentFile.id);
        }
        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe((resp: any) => {
            console.log('file resp', resp);
            const state = this.multimediaObj ? 'actualizado' : 'creado';
            const type = this.multimediaType;
            if (resp) {
                this.currentFile = resp.body[0];
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
        console.log(this.multimediaForm);
        const method = this.multimediaObj ? 'patch' : 'post';
        const path = this.multimediaObj ? `contents/${this.multimediaObj.id}` : 'contents' ;
        const formControls = this.multimediaForm.controls;
        console.log('is valid ', this.multimediaFormIsValid());
        if (this.multimediaFormIsValid()) {
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
                if (resp && resp.body) {
                    this.onSaveThumbnail(resp.body.id);
                    this.multimediaObj = resp.body;
                }
            });
        }

    }

    public removeSelected(event) {
        this.relatedReports = this.relatedReports.filter((report: any) =>  report.id !== event.id);
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

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
        this.resetMultimediaForm();
        this.isAdding.emit(false);
    }

    public multimediaFormIsValid(): boolean {
        return this.multimediaForm.status !== 'INVALID' &&
            this.tags.length !== 0 &&
            this.uploadFileForm.get('thumbnail').value !== '';
    }

    public openDialogCancel(): void {
        const dialog = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                isAlert: true,
                config: {
                    icon: 'icon-exclamation',
                    title: 'Está seguro que desea salir sin plublicar',
                    mainButton: 'Si, quiero salir'
                }
            }
        });

        dialog.afterClosed().subscribe((confirmation: boolean) => {
           if (confirmation) {
               this.updateView();
           }
        });
    }

    public resetMultimediaForm(): void {
        this.multimediaForm.reset({
            title: '',
            description: '',
            url: '',
            firstRelated: '',
            secondRelated: '',
            thirdRelated: '',
        });
        this.uploadFileForm.get('thumbnail').setValue('');
        this.currentFile = null;
        this.multimediaObj = null;
        this.tags = [];
    }
}

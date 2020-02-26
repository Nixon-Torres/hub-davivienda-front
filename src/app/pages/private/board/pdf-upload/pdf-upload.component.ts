import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HttpService } from '../../../../services/http.service';

@Component({
    selector: 'app-pdf-upload',
    templateUrl: './pdf-upload.component.html',
    styleUrls: ['./pdf-upload.component.scss']
})
export class PdfUploadComponent implements OnInit {
    public uploadForm: FormGroup;
    public fileData: any = null;
    public spinner: boolean;
    public errorMsg: string;
    public workMsg: string;
    
    constructor(
        public dialogRef: MatDialogRef<PdfUploadComponent>,
        private formBuilder: FormBuilder,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        this.uploadForm = this.formBuilder.group({
            file: ['']
        });
    }

    onFileSelect(event: any): void {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.uploadForm.get('file').setValue(file);
            this.onSubmit();
        }
    }

    onSubmit(): void {
        const formData = new FormData();
        formData.append('types', encodeURI(JSON.stringify(['pdf'])));
        formData.append('file', this.uploadForm.get('file').value);
        formData.append('key', 'pdffile');
        formData.append('resourceId', this.data.reportId);
        this.spinner = true;
        this.errorMsg = null;
        this.fileData = null;
        this.http.post({
            path: 'media/upload',
            data: formData
        }).subscribe(
            (response: any) => {
                this.spinner = false;
                if (response.body.name && (response.body.statusCode || response.body.code)) {
                    let err = response.body.name;
                    this.errorMsg = (err == 'ValidationError') ? 'Solo se permite archivos PDFS' : 'Ha superado del tamaño maximo del archivo';
                    document.querySelector("#iFile")['value'] = '';
                    return;
                }
                this.fileData = response.body;
            },
            () => {
                this.spinner = false;
                this.fileData = null;
                document.querySelector("#iFile")['value'] = '';
            }
        );
    }

    deleteFile(): void {
        this.spinner = true;
        this.http.delete({
            path: `media/${this.fileData.id}`
        }).subscribe(() => {
            this.spinner = false;
            this.fileData = null;
            document.querySelector("#iFile")['value'] = '';
        });
    }

    closeDialog(data: any): void {
        this.dialogRef.close(data);
    }
}

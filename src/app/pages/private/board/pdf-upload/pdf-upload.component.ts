import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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

    constructor(
        public dialogRef: MatDialogRef<PdfUploadComponent>,
        private formBuilder: FormBuilder,
        private http: HttpService
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
        this.spinner = true;
        this.errorMsg = null;
        this.http.post({
            path: 'upload',
            data: formData
        }).subscribe(
          (response: any) => {
            this.spinner = false;
            if(response.body.name && (response.body.statusCode || response.body.code)) {
              let err = response.body.name;
              this.errorMsg = (err == 'ValidationError') ? 'Solo se permite archivos PDFS' : 'Ha superado del tamaño maximo del archivo';
              return;
            }
            this.fileData = response.body;
        });
    }

    closeDialog(data: any): void {
        this.dialogRef.close(data);
    }
}

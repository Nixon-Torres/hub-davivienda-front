import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
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
    public errorMsg: string = 'Ha superado del tamaño maximo del archivo';

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

    onFileSelect(event: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.uploadForm.get('file').setValue(file);
        }
    }

    onSubmit() {
        const formData = new FormData();
        formData.append('file', this.uploadForm.get('file').value);
        this.spinner = true;
        this.http.post({
            path: 'upload',
            data: formData
        }).subscribe((response: any) => {
            this.fileData = response.body;
            this.spinner = false;
        });
    }

    closeDialog(data: any): void {
        this.dialogRef.close(data);
    }
}

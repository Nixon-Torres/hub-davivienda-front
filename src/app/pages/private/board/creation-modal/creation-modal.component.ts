import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HttpService} from '../../../../services/http.service';
import {AuthService} from '../../../../services/auth.service';

@Component({
    selector: 'app-creation-modal',
    templateUrl: './creation-modal.component.html',
    styleUrls: ['./creation-modal.component.scss'],
})
export class CreationModalComponent implements OnInit {

    public templateName: string;
    public dontShow: boolean;

    constructor(
        public dialogRef: MatDialogRef<CreationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpService,
        private auth: AuthService,
    ) {
    }

    ngOnInit() {
        this.getTemplateName();
    }

    private getTemplateName() {
        this.http.get({
            path: `templates/${this.data.templateId}`
        }).subscribe((template: any) => {
            if(template) {
                this.templateName = template.body.name;
            }
        });
    }

    rememberDontShow() {
        const reportCreationWizard = this.dontShow ? this.dontShow : false;
        this.http.patch({
            path: 'users',
            data: {
                reportCreationWizardHidden: reportCreationWizard,
                id: this.data.userId
            }
        }).subscribe((resp: any) => {
            if (resp) {
                this.auth.setUserData('reportCreationWizardHidden', reportCreationWizard);
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}

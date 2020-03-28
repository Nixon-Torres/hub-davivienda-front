import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ConfigDialog} from './confirmation-dialog.model';

@Component({
    selector: 'app-revision-modal',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
    public config: ConfigDialog;
    public alert: boolean;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // debugger
        // this.config = Object.assign(defaultConfig, this.data.config);
        this.config = this.data.config;
        this.alert = this.data.isAlert ? this.data.isAlert : false;
        this.alertDefaultState();
    }

    public alertDefaultState() {
        if (this.alert && this.config) {
            this.config = {
                twoButtons: true,
                icon: this.config.icon ? this.config.icon : 'icon-exclamation-triangle',
                iconColor: this.config.iconColor ? this.config.iconColor : '#FF003B',
                isWarning: this.config.isWarning,
                warningText: this.config.warningText,
                title: this.config.title,
                titleStyle: this.config.titleStyle,
                subtitle: this.config.subtitle,
                subtitleStyle: this.config.subtitleStyle,
                mainButton: this.config.mainButton ? this.config.mainButton : 'Continuar',
                mainButtonStyle: this.config.mainButtonStyle,
                secondButton: this.config.secondButton ? this.config.secondButton : 'Cancelar',
                secondButtonStyle: this.config.secondButtonStyle
            };
        }
    }

    closeDialog(alert?: boolean): void {
        this.dialogRef.close(alert);
    }
}

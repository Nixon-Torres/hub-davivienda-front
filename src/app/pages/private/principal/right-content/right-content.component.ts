
import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {
    icurrentFolder: string;
    icurrentState: string;
    ideletedFg = false;

    public list: any = {
        reports: []
    }

    @Input()
    set currentFolder(value: string) {
        console.log('new folder:', value);
        this.icurrentFolder = value;
    }

    @Input()
    set currentState(value: string) {
        console.log('new state:', value);
        this.icurrentState = value;
    }

    @Input()
    set deletedFg(value) {
        console.log('new fg:', value);
        this.ideletedFg = value;
    }

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpService
    ) { }

    openDialog(): void {
        const dialogRef = this.dialog.open(CreateReportDialogComponent, {
            width: '1500px'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            console.log('The dialog was closed', result);
        });
    }

    ngOnInit() {
        this.loadReports();
    }

    private loadReports(): void {
        this.http.get({
            path: 'reports?filter[include][0][relation]=folder&filter[include][1][relation]=' +
                  'user&filter[include][2][relation]=state&filter[include][3][relation]=section'
        }).subscribe((response) => {
            this.list.reports = response.body;
        });
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }
}

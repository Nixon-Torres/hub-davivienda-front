
import { Component, OnInit } from '@angular/core';
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
    public list: any = {
        'reports': []
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
            'path': 'reports?filter[include][0][relation]=folder&filter[include][1][relation]=user&filter[include][2][relation]=state&filter[include][3][relation]=section'
        }).subscribe((response) => {
            this.list.reports = response.body;
        });
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }
}

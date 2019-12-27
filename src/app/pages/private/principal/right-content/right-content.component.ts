
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

    private loadReports(filter? : string | null): void {
        // var query1 = qs.stringify(query,{skipNulls: true }); 
        // var query1 = qs.parse('filter[include][0][relation]=folder&filter[include][1][relation]=user&filter[include][2][relation]=state&filter[include][3][relation]=section&filter[where][name][like]=98');       
        var query = 'reports?filter[include][0][relation]=folder&filter[include][1][relation]=user&filter[include][2][relation]=state&filter[include][3][relation]=section'
        var queryfilter = '&filter[where][name][like]='+filter;
        if(filter){
            query+=queryfilter;
        }
        this.http.get({
            'path': query
        }).subscribe((response) => {
            this.list.reports = response.body;
        });
    }

    public filterReports(text : string){
        this.loadReports(text);
    }

    public gotoPage(input: string) {
        this.router.navigate(['app/board', input]);
    }
}

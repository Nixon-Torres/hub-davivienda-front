
import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { Router } from '@angular/router';
import {loopback} from '../../../../models/common/loopback.model'
import * as qs from 'qs';

@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit { 

    icurrentObj: {
        currentFolder: "",
        currentState: "",
        deletedFg : false
    };  

    ifilter : string;

    public list: any = {
        reports: []
    }

    @Input()
    set currentObj(value: any) {
        console.log('new state:', value);
        this.icurrentObj = value;
        if(this.icurrentObj) {
            this.loadReports(this.ifilter);
        }
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
        //this.loadReports();
    }

    private loadReports(filter? : string | null): void {
        this.ifilter=filter;
        var query = new loopback();        
        query.filter.include.push({ relation : "folder"},{ relation : "user"}, { relation : "state"} , { relation : "section"} )
        query.filter.where['folderId'] = this.icurrentObj.currentFolder;
        query.filter.where['stateId'] = this.icurrentObj.currentState;
        query.filter.where['trash'] = this.icurrentObj.deletedFg;
        this.ifilter ? query.filter.where['name'] = {like:this.ifilter} : null ;

        console.log('query',JSON.stringify(qs.parse(qs.stringify(query,{skipNulls: true }))));
        this.http.get({
            path: 'reports?'+qs.stringify(query,{skipNulls: true }) 
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

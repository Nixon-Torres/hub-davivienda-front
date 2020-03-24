import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {loopback} from '../../../../models/common/loopback.model';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-how-is-economy',
    templateUrl: './how-is-economy.component.html',
    styleUrls: ['./how-is-economy.component.scss']
})
export class HowIsEconomyComponent implements OnInit {

    public areas: any = [
        {label: 'outstanding', newReportId: '', oldReportId: ''},
        {label: 'report1', newReportId: '', oldReportId: ''},
        {label: 'report2', newReportId: '', oldReportId: ''},
        {label: 'report3', newReportId: '', oldReportId: ''},
        {label: 'report4', newReportId: '', oldReportId: ''},
    ];

    public list: any = {
        outstandedReport: [],
        reports: [],
        currentReports: [],
        reportsCopy: []
    };
    public report: any;
    public newReport: any;

    public currentArea = '';
    public time = '';
    public name = '';

    public content: any = [];
    public header: string;
    public reportOne: string;
    public reportTwo: string;
    public reportThree: string;
    public reportFour: string;
    public showPanel: boolean;

    constructor(
        private http: HttpService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getReports();
        this.getOutstandingReports();
        this.getCurrentReports();
        this.getContent();
    }

    public getOutstandingReports() {
        this.http.get({
            path: 'reports/',
            data: {where: {howseconomy: true}},
            encode: true
        }).subscribe((response: any) => {
            this.list.outstandedReport = response.body;
        }, (error: any) => {
            console.error(error);
        });
    }

    public getReports() {
        this.http.get({
            path: 'reports/',
            data: {where: {stateId: '5e068c81d811c55eb40d14d0'}},
            encode: true
        }).subscribe((response: any) => {
            this.list.reports = response.body;
        }, (error: any) => {
            console.error(error);
        });
    }

    public getCurrentReports() {
        const query = new loopback();
        query.filter.where = {howseconomy: true};

        this.http.get({
            path: 'reports/',
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            this.list.currentReports = response.body;
            this.report = this.list.currentReports && this.list.currentReports.length ? this.list.currentReports[0] : null;
            this.header = this.report;
        }, (error: any) => {
            console.error(error);
        });
    }

    public onOptionsSelected(event) {
        this.newReport = event;
    }

    public onCheck(area) {
        this.currentArea = area;
    }

    public onSAve() {
        this.list.currentReports.forEach((report) => {
            if (report.id !== this.newReport.id) {
                this.updateReport(report.id, false);
                this.updateReport(this.newReport.id, true);
            }
        });

        this.saveContent();
    }

    public updateReport(id, howseconomy) {
        const data = {howseconomy};
        this.http.patch({
            path: 'reports/' + id,
            data
        }).subscribe((response: any) => {
        }, (error: any) => {
            console.error(error);
        });
    }

    public saveContent() {
        const id = this.content ? '/' + this.content.id : '';
        const verb = this.content ? 'patch' : 'post';

        this.http[verb]({
            path: 'contents' + id,
            data: {key: 'howseconomyKey'}
        }).subscribe((response: any) => {
            this.getContent();
            this.getCurrentReports();
            this.showConfirmation();
        });
    }

    public getContent() {
        this.http.get({
            path: 'contents',
            data: {where: {key: 'howseconomyKey'}, include: ['lastUpdater']},
            encode: true
        }).subscribe((response) => {
            if ((response.body as unknown as []).length > 0) {
                this.name = response.body[0].lastUpdater.name;
                this.time = response.body[0].updatedAt;
                this.content = response.body[0];
            }
        });
    }

    public showConfirmation() {
        this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                title: 'Se ha publicado exitosamente los ajustes de Como va la economía',
            }
        });
    }
}

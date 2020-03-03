import { Component, OnInit } from '@angular/core';
import { HttpService} from '../../../../services/http.service';
import { loopback} from '../../../../models/common/loopback.model';
import { ConfirmationDialogComponent } from '../../board/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-investment-strategies',
	templateUrl: './investment-strategies.component.html',
	styleUrls: ['./investment-strategies.component.scss']
})
export class InvestmentStrategiesComponent implements OnInit {

	public areas: any = [
		{label:'outstanding', newReportId:'',oldReportId:''},
		{label:'report1', newReportId:'',oldReportId:''},
		{label:'report2', newReportId:'',oldReportId:''},
		{label:'report3', newReportId:'',oldReportId:''},
		{label:'report4', newReportId:'',oldReportId:''},
	];

	public list: any =  {
		outstandedReport: [],
		reports: [],
		currentReports: [],
		reportsCopy: []
	}

	public currentArea: string = '';
	public time: string = '';
	public name: string = '';

	public content: any = [];
	public header: string;
	public reportOne: string;
	public reportTwo: string;
	public reportThree: string;
	public reportFour: string;

	constructor(
		private http: HttpService,
		public dialog: MatDialog
	) {}

	ngOnInit() {
		this.getReports();
		this.getOutstandingReports();
		this.getCurrentReports();
		this.getContent();
	}

	public getOutstandingReports() {
		this.http.get({
			path: 'reports/',
			data: {where: {outstanding: true}},
			encode: true
		}).subscribe((response: any) => {
			this.list.outstandedReport = response.body;
		}, (error: any) => {
		console.error(error);
		});
	}

	public getReports() {
		this.http.get({
			path: 'reports/'
		}).subscribe((response: any) => {
			this.list.reports = response.body;
		}, (error: any) => {
			console.error(error);
		});
	}

	public getCurrentReports() {

		var query = new loopback();
		query.filter.where['strategy'] = true;
		query.filter.order = 'strategyArea ASC';

		this.http.get({
			path: 'reports/',
			data: query.filter,
			encode: true
		}).subscribe((response: any) => {
			this.list.currentReports = response.body;
			this.selectedReport();
		}, (error: any) => {
			console.error(error);
		});
	}

	public onOptionsSelected(event) {

		let oldReport = this.list.currentReports.find(e => e.strategyArea === this.currentArea);
		let report = this.areas.find(e => e.label === this.currentArea);
		let reportIndex = this.list.reports.findIndex(element => element.id == event.id);

		report.newReportId = event.id;

		if (oldReport && oldReport.id !== event.id)
			report.oldReportId = oldReport.id;

		if (reportIndex >= 0) 
			this.list.reports.splice(reportIndex,1);


	}

	public onCheck(area) {
		this.currentArea = area; 
	}

	public onSAve() {
		this.areas.forEach((element) => {

			if (element.newReportId) 
				this.updateReport(element.newReportId,element.label,true);
			
			if (element.oldReportId) 
				this.updateReport(element.oldReportId,'',false);

		});

		this.saveContent();
		
	}

	public updateReport(id, label, strategy) {
		let data = {strategy:strategy, strategyArea: label} 
		this.http.patch({
			path: 'reports/'+ id,
			data: data
		}).subscribe((response: any) => {
		}, (error: any) => {
			console.error(error);
		});
	}

	public getOutstanding(area) {
		return area === 'outstanding' ? true : false;
	}

	public selectedReport() {
		let report;

		this.areas.forEach((element) => {
			report = this.list.currentReports.find(e => e.strategyArea === element.label);
			if (report) {
				switch (element.label) {
					case 'outstanding': this.header = report.name; break;
					case 'report1': this.reportOne = report.name; break;
					case 'report2': this.reportTwo = report.name; break;
					case 'report3': this.reportThree = report.name; break;
					case 'report4': this.reportFour = report.name; break;
				}				
			}
			
		});

	}

	public saveContent() {
		let id = '';
	    if (this.content) 
	    	id = '/'+this.content.id;
		this.http.patch({
		  path: 'contents'+id,
		  data: { key : 'strategyKey'}
		}).subscribe((response: any) => {
			this.getContent();
			this.getCurrentReports();
			this.showConfirmation();
		});
	}

	public getContent() {
		this.http.get({
		  path: 'contents',
		  data: {where: { key: 'strategyKey' }, include: ['lastUpdater']},
		  encode: true
		}).subscribe((response) => {
			this.name = response.body[0].lastUpdater.name;
			this.time = response.body[0].updatedAt;
			this.content = response.body[0];
		});
	}

	public showConfirmation() {
		this.dialog.open(ConfirmationDialogComponent, {
		    width: '410px',
		    data: {
		        title: 'Se ha publicado exitosamente los ajustes de Estrategia para invertir',
		    }
		});
	} 

}

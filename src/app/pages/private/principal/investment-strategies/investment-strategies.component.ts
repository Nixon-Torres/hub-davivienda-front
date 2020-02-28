import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../services/http.service';

@Component({
	selector: 'app-investment-strategies',
	templateUrl: './investment-strategies.component.html',
	styleUrls: ['./investment-strategies.component.scss']
})
export class InvestmentStrategiesComponent implements OnInit {

	public areas: any = {
		outstanding : null,
		report1 : null,
		report2 : null,
		report3 : null,
		report4 : null
	}
	public list: any =  {
		outstandedReport: [],
		reports: [],
		currentReports: []
	}

	public currentArea: string = '';

	constructor(
		private http: HttpService,
		) { }

	ngOnInit() {
		this.getReports();
		this.getOutstandingReports();
		this.getCurrentReports();
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
		this.http.get({
			path: 'reports/',
			data: {where: {strategy: true}},
			encode: true
		}).subscribe((response: any) => {
			this.list.currentReports = response.body;
		}, (error: any) => {
		console.error(error);
		});
	}

	public onOptionsSelected(event) {
		this.areas[this.currentArea] = event.id;
		console.log(this.areas);
	}

	public onCheck(area) {
		this.currentArea = area; 
	}

	public onSAve() {
		let report;
		let newReport;

		// if(this.areas.outstanding != null) {
		// 	this.updateReport(this.areas.outstanding,'outstanding',true);
		// 	report = this.list.currentReports.find(e => e.strategyArea === 'outstanding');
		// 	this.updateReport(report.id,'',false);
		// }

		if(this.areas.report1 != null) {
			report = this.list.currentReports.find(e => e.strategyArea === 'report1');
			newReport = this.list.reports.find(e => e.id === this.areas.report1);			
			if (report)
				this.updateReport(newReport,'report1',true, report.id);
			else 
				this.updateReport(newReport,'report1',true, '0');
		}
		
		// if(this.areas.report2 != null) {
		// 	this.updateReport(this.areas.report2,'report2',true);
		// 	report = this.list.currentReports.find(e => e.strategyArea === 'report2');
		// 	this.updateReport(report.id,'',false);
		// }
		
		// if(this.areas.report3 != null) {
		// 	this.updateReport(this.areas.report3,'report3',true);
		// 	report = this.list.currentReports.find(e => e.strategyArea === 'report3');
		// 	this.updateReport(report.id,'',false);
		// }
		
		// if(this.areas.report4 != null) {
		// 	this.updateReport(this.areas.report4,'report4',true);
		// 	report = this.list.currentReports.find(e => e.strategyArea === 'report4');
		// 	this.updateReport(report.id,'',false);
		// } 
	}

	public updateReport(report,area,strategy,reportId) {
		report.strategy = strategy;
		report.strategyArea = area;
		// let data = {strategy:strategy, strategyArea:area}
		this.http.patch({
			path: 'reports/'+report.id,
			data: report
		}).subscribe((response: any) => {
			if (reportId != '0')
				this.updateReport(reportId,'',false,'0');
			//this.list.reports = response.body;
		}, (error: any) => {
			console.error(error);
		});
	}

}

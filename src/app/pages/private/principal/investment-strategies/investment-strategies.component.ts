import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../services/http.service';

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
		let oldReport = this.list.currentReports.find(e => e.strategyArea === this.currentArea);
		let report = this.areas.find(e => e.label === this.currentArea);

		report.newReportId = event.id;

		if (oldReport && oldReport.id !== event.id)
			report.oldReportId = oldReport.id;
	}

	public onCheck(area) {
		this.currentArea = area; 
	}

	public onSAve() {

		this.areas.forEach(function (element) {
			if (element.newReportId) {
				console.log(element);
			}
		});

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

}

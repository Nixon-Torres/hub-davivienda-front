import { Component, OnInit } from '@angular/core';
import {HttpService} from '../../../../services/http.service';

@Component({
	selector: 'app-investment-strategies',
	templateUrl: './investment-strategies.component.html',
	styleUrls: ['./investment-strategies.component.scss']
})
export class InvestmentStrategiesComponent implements OnInit {

	constructor(
		private http: HttpService,
		) { }

	ngOnInit() {
	}


	// public getoutstandingReports() {
	//     this.http.get({
	//         path: 'reports/',
	//         data: {where: {outstanding: true}},
	//         encode: true
	//     }).subscribe((response: any) => {
	//         this.remarkableReports = response.body;
	//     }, (error: any) => {
	//         console.error(error);
	//     });
	// }

}

import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';

@Component({
	selector: 'app-related-reports',
	templateUrl: './related-reports.component.html',
	styleUrls: ['./related-reports.component.scss']
})
export class RelatedReportsComponent implements OnInit {

	public timer: any;
	public ifilter;

	constructor(
		private http: HttpService
	) { }

	ngOnInit() {
	}

	getToRelated(): void {
		if (this.timer.toRelated) clearTimeout(this.timer.toRelated);
		this.timer.toRelated = setTimeout(() => {
			this.http.get({
				path: 'reports',
				data: {
					where: {
						id: {
							nin: ['ya1', 'ya2', '...']
						},
						name: {
							like: this.ifilter, options: "i"
						}
					}
				},
				encode: true
			}).suscribe((response: any) => {
				console.log('resultado de reportes a relacionar', response.body);
			});
		}, 800);
	}

	saveReportRelate(): void {
		this.http.post({
			path: 'reportsRelated',
			data: {
				reportId: 'uid del reporte papi',
				relatedId: 'uid del reporte bebe',
				order: 'orden del reporte'
			}
		}).suscribe((response) => {
			console.log('Si guardo MK, jajajaj que Chimba!');
		});
	}

	deleteReportRelate(): void {
		this.http.delete({
			path: 'reportsRelated/{id}'
		}).suscribe(() => {
			console.log('Algun día te volvere a dar.... Jajajajjaj');
			console.log('Traiganme unas chelas.');
		});
	}

}

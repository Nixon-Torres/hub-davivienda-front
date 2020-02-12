import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpService } from '../../../../services/http.service';

@Component({
	selector: 'app-related-reports',
	templateUrl: './related-reports.component.html',
	styleUrls: ['./related-reports.component.scss']
})

export class RelatedReportsComponent implements OnInit {

	public timer: any;
	public ifilter;
	private relatedReports: any = [];

	public movies = [
		'1 prueba',
		'2 prueba',
		'3 prueba',
		'4 prueba',
	];

	constructor(
		private http: HttpService
	) { }

	@Input('reportId') private reportId: string;

	public drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
	}

	public deleteRelationship(e) {
		let key = e.target.getAttribute("data-index");
		this.movies.splice(key, 1);
	}

	ngOnInit() {
		console.log("ID: ", this.reportId);
		this.getRelatedReports();
	}

	private getRelatedReports() {
		console.log("get");
		this.http.get({
			path: `reports/${this.reportId}/relateds`
		}).subscribe((response: any) => {
			console.log('resultado de reportes relacionados', response.body);
		});
	}

	searchReports(): void {
		if (this.timer.toRelated) clearTimeout(this.timer.toRelated);
		this.timer.toRelated = setTimeout(() => {
			this.http.get({
				path: 'reports',
				data: {
					where: {
						id: {
							nin: this.relatedReports
						},
						name: {
							like: this.ifilter, options: "i"
						}
					}
				},
				encode: true
			}).subscribe((response: any) => {
				console.log('resultado de reportes a relacionar', response.body);
			});
		}, 800);
	}

	relateReports(): void {
		this.http.post({
			path: 'reportsRelated',
			data: {
				reportId: this.reportId,
				relatedId: '5e3afb52040ea7244a32be79',
				pos: 1
			}
		}).subscribe((response) => {
			console.log('Si guardo MK, jajajaj que Chimba!');
		});
	}

	deleteReportRelationship(): void {
		this.http.delete({
			path: 'reportsRelated/{id}'
		}).subscribe(() => {
			console.log('Algun día te volvere a dar.... Jajajajjaj');
			console.log('Traiganme unas chelas.');
		});
	}

}

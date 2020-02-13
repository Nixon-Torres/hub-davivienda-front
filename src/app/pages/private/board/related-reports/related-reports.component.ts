import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpService } from '../../../../services/http.service';

@Component({
	selector: 'app-related-reports',
	templateUrl: './related-reports.component.html',
	styleUrls: ['./related-reports.component.scss']
})

export class RelatedReportsComponent implements OnInit {

	@Input('reportId') private reportId: string;

	public timer: any = {
		toRelated: null
	}
	public ifilter;
	public relatedReports: any = [];
	public findedReports: any = [];

	constructor(
		private http: HttpService
	) { }

	ngOnInit() {
		this.getRelatedReports();
	}

	public drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.relatedReports, event.previousIndex, event.currentIndex);
		this.saveRelatations(this.relatedReports);
	}

	private getRelatedReports() {
		this.http.get({
			path: `reports/${this.reportId}/relateds`,
			data: {
				include: [
					{ 
						relation: 'related',
						scope: {
							fields: ['name']
						}
					}
				],
				order: 'pos ASC'
			},
			encode: true
		}).subscribe((response: any) => {
			this.relatedReports = response.body; 
		});
	}

	public searchReports(): void {
		if (this.timer.toRelated) clearTimeout(this.timer.toRelated);
		if (!this.ifilter.replace(/\s/g, '').length) {
			this.findedReports = [];
			document.getElementById("foundedReports").classList.remove("show");
			return;
		}

		this.timer.toRelated = setTimeout(() => {
			this.http.get({
				path: 'reports',
				data: {
					fields: ['id', 'name'],
					where: {
						and: [{
							id: {
								nin: [this.reportId].concat(this.relatedReports.map((a) => a.id))
							},
							name: {
								like: this.ifilter, options: "i"
							},
							trash: false
						}]
					}
				},
				encode: true
			}).subscribe((response: any) => {
				this.findedReports = response.body;
				document.getElementById("foundedReports").classList.add("show");
			});
		}, 800);
	}

	public saveRelatations(input: Array<any>, fn?: Function): any {
		this.rcSaveRelations(input, 0, () => {
			if(fn) return fn();
		});
	}

	private rcSaveRelations(input, index, fn): Function {
		if(index == input.length) return fn();
		let val = input[index];
		let path = val.id ? `reportsRelated/${val.id}` : 'reportsRelated';
		let method = val.id ? 'patch' : 'post';
		let data = val.id ? {
			pos: val.pos
		} : {
			pos: val.pos,
			reportId: val.reportId,
			relateId: val.relatedId
		}

		this.http[method]({
			path: path,
			data: data
		}).subscribe((response: any) => {
			if(!val.id) {
				response.body['related'] = val.related;
				this.relatedReports.push(response.body);
			}
			index++;
			this.rcSaveRelations(input, index, fn);
		});
	}

	public relateReport(related): void {
		this.saveRelatations([
			{
				reportId: this.reportId,
				relatedId: related.id,
				pos: this.relatedReports.length,
				related: {
					id: related.id,
					name: related.name
				}
			}
		], () => {
			document.getElementById("foundedReports").classList.remove("show");
			document.getElementById("searchReports").firstChild.value = "";
			this.findedReports = [];
		});
	}

	public deleteReportRelationship(related): void {
		this.http.delete({
			path: `reportsRelated/${related.id}`
		}).subscribe(() => {
			this.relatedReports.splice(related.pos, 1);
		});
	}

}

import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Report } from '../../board/board.model';
import { loopback } from '../../../../models/common/loopback.model';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { HttpService } from '../../../../services/http.service';

import * as qs from 'qs';
import * as moment from 'moment';

@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {

	@Output() valueChange = new EventEmitter();

	public calendarOpen : boolean = false;
	public startDate: any;
	public endDate: any; 

	icurrentObj: {
		currentFolder: null,
		currentState: null,
		deletedFg: false,
		currentStateName: 'Todos Informes'
	};

	ifilter: string;
	ifilterdate: any;
	ifilterreviewed: boolean = true;

	public list: any = {
		reports: [],
		folders: []
	}
	public pager: any = {
		limit: 10,
		selected: 1,
		totalItems: 0,
		totalPages: 0,
		pages: []
	}
	public listForm: FormGroup;

	@Input()
	set currentObj(value: any) {
		this.icurrentObj = value;
		if (this.icurrentObj) {
			this.loadReports(this.ifilter);
		}
	}

	constructor(
		public dialog: MatDialog,
		private router: Router,
		private http: HttpService
	) {
		this.listForm = new FormGroup({
			'reports': new FormArray([])
		});
	}

	toggleCalendar(){
		if(!this.calendarOpen){
			this.calendarOpen = true;
		}else{
			this.calendarOpen = false;
		}
	}

	openDialog(): void {
		this.dialog.open(CreateReportDialogComponent, {
			width: '1500px',
			data: {
				'folderId': (this.icurrentObj.currentFolder ? this.icurrentObj.currentFolder : false),
				'stateId': '5e068d1cb81d1c5f29b62977'
			}
		});
	}

	ngOnInit() {
		this.loadReports();
		this.getFolders();
	}


	private saveReport(clone: any): void {
		this.http.post({
			'path': 'reports',
			'data': clone
		}).subscribe(() => {
		});
	}

	private deleteReport(id: string): void {
		this.http.patch({
			path: 'reports/' + id,
			data: {
				trash: true
			}
		}).subscribe(() => {
		});
	}

	private getFolders(): void {
		this.http.get({
			'path': 'folders/'
		}).subscribe((response: any) => {
			this.list.folders = response.body;
		});
	}

	public gotoPage(input: string) {
		this.router.navigate(['app/board', input]);
	}

	public tabClick(event: any) {
		this.ifilterreviewed = (event.index === 0 ? true : false);
		this.loadReports(this.ifilter);
	}

	private loadPager(where: any): void {
		this.http.get({
			path: `reports/count?${qs.stringify({ 'where': where }, { skipNulls: true })}`
		}).subscribe((response: any) => {
			this.pager.totalItems = response.body.count;
			this.pager.totalPages = Math.ceil(this.pager.totalItems / this.pager.limit);
			this.pager.selected = 1;
			this.pager.pages = [];
			for (let i = 1; i <= this.pager.totalPages; i++) {
				this.pager.pages.push({
					'skip': (i - 1) * this.pager.limit,
					'index': i
				});
			}
		});
	}

	public loadReports(filter?: string | null, pager?: any): void {
		this.ifilter = filter;
		var query = new loopback();
		query.filter.include.push({ relation: "folder" }, { relation: "owner" }, { relation: "state" }, { relation: "section" });
		query.filter.where['folderId'] = this.icurrentObj.currentFolder;
		query.filter.where['stateId'] = this.icurrentObj.currentState;
		query.filter.where['trash'] = typeof this.icurrentObj.deletedFg === 'undefined' ? false : this.icurrentObj.deletedFg;
		query.filter.where['reviewed'] = this.ifilterreviewed;
		this.ifilter ? query.filter.where['name'] = { like: this.ifilter } : null;
		if (this.ifilterdate) {
			let start = moment(this.ifilterdate.start).subtract(5, 'hours').toISOString();
			let end = moment(this.ifilterdate.end).subtract(5, 'hours').toISOString();
			query.filter.where['updatedAt'] = { between: [start, end] };
		}

		if (pager) {
			query.filter.limit = this.pager.limit;
			query.filter.skip = pager.skip;
			this.pager.selected = pager.index;
		} else {
			this.loadPager(query.filter.where);
			query.filter.limit = this.pager.limit;
			query.filter.skip = 0;
		}

		this.clearCheckboxes(this.listForm.controls.reports as FormArray);
		this.list.reports = [];
		this.http.get({
			path: `reports?${qs.stringify(query, { skipNulls: true })}`
		}).subscribe((response: any) => {
			this.addCheckboxes(response.body);
			setTimeout(() => {
				this.list.reports = response.body;
			}, 100)

		});
	}

	private addCheckboxes(reports: Array<any>): void {
		for (let iReport in reports) {
			if (reports.hasOwnProperty(iReport)) {
				const control = new FormControl(false);
				(this.listForm.controls.reports as FormArray).push(control);
			}
		}
	}

	private clearCheckboxes(formArray: FormArray): void {
		while (formArray.length !== 0) {
			formArray.removeAt(0);
		}
	}

	public getCheckboxesSelected(): Array<any> {
		return this.listForm.value.reports
			.map((v: any, i: number) => v ? this.list.reports[i].id : null)
			.filter((v: any) => v !== null);
	}

	public moveReports(event: any): void {
		let selecteds: Array<string> = this.getCheckboxesSelected();
		let toUpdate: Array<any> = this.list.reports.filter((a: any) => {
			if (selecteds.indexOf(a.id) !== -1) {
				a.folderId = event.value;
				return true;
			}
			return false;
		});

		this.rcPutReport(toUpdate, 0, () => {
			this.loadReports(this.ifilter);
		});
	}

	public deleteReports(): void {
		let selecteds: Array<string> = this.getCheckboxesSelected();
		let toUpdate: Array<any> = this.list.reports.filter((a: any) => {
			if (selecteds.indexOf(a.id) !== -1) {
				a.trash = true;
				return true;
			}
			return false;
		});

		this.rcPutReport(toUpdate, 0, () => {
			this.loadReports(this.ifilter);
		});
	}

	private rcPutReport(reports: Array<any>, index: number, fn: any): void {
		if (index == reports.length) {
			fn();
			return;
		}
		let report: any = reports[index];
		let data: Report = {
			'id': report.id,
			'name': report.name,
			'slug': report.slug,
			'trash': report.trash,
			'content': report.content,
			'styles': report.styles,
			'sectionTypeKey': report.sectionTypeKey,
			'templateId': report.templateId,
			'stateId': report.stateId,
			'sectionId': report.sectionId,
			'folderId': report.folderId
		};
		this.http.put({
			'path': `reports/${data.id}`,
			'data': data
		}).subscribe(
			() => {
				index++;
				this.rcPutReport(reports, index, fn);
			},
			() => {
				alert('Oops!!! \nNo actualizamos tus datos. Intenta más tarde');
			}
		);
	}

	public filterReports(text: string) {
		this.loadReports(text);
	}

	public filterDateReports() {
		this.ifilterdate = {
		    start: this.startDate.toString(),
		    end: this.endDate.toString().replace('00:00:00', '23:59:59')
		};

		this.calendarOpen = false;
		this.loadReports(this.ifilter);
	}

	public onDateUpdate (event: any) {
		this.startDate = event.startDate.toString();
		this.endDate = event.endDate.toString().replace('00:00:00', '23:59:59');
	}



	isFiltering() {
		return this.icurrentObj.currentFolder || this.icurrentObj.currentState ||
			this.icurrentObj.deletedFg;
	}

	cleanFilters() {
		this.icurrentObj = {
			currentFolder: null,
			currentState: null,
			deletedFg: false,
			currentStateName: 'Todos Informes'
		};
		this.loadReports();
		this.valueChange.emit(null);
	}

	public onCloneReport(event: Event, pos: number) {
		event.preventDefault();

		let clone = Object.assign({}, this.list.reports[pos]);
		clone.name = clone.name + ' Copia';
		clone.slug = clone.slug + '-copia';
		this.list.reports.splice(pos + 1, 0, clone);

		let newReport: any = {
			name: clone.name,
			slug: clone.slug,
			trash: clone.trash,
			content: clone.content,
			sectionTypeKey: clone.sectionTypeKey,
			templateId: clone.templateId,
			userId: clone.userId,
			stateId: clone.stateId,
			sectionId: clone.sectionId,
			folderId: clone.folderId
		};

		this.saveReport(newReport);
	}

	public onDeleteReport(event: Event, pos: number) {
		let reportId = this.list.reports[pos].id;
		this.list.reports.splice(pos, 1);

		this.deleteReport(reportId);
	}

}

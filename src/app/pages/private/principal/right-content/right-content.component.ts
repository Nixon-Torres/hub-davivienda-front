import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpService} from '../../../../services/http.service';
import {CreateReportDialogComponent} from '../create-report-dialog/create-report-dialog.component';
import {Router} from '@angular/router';
import {loopback} from '../../../../models/common/loopback.model';
import * as qs from 'qs';

@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {

	@Output() valueChange = new EventEmitter();

	icurrentObj: {
		currentFolder: null,
		currentState: null,
		deletedFg: false,
		currentStateName: 'Todos Informes'
	};

	ifilter: string;

	public list: any = {
		reports: []
	}

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
	}

	openDialog(): void {
		const dialogRef = this.dialog.open(CreateReportDialogComponent, {
			width: '1500px'
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			console.log('The dialog was closed', result);
		});
	}

	ngOnInit() {
		this.loadReports();
	}


	private saveReport(clone): void {
		this.http.post({
			'path': 'reports',
			'data': clone
		}).subscribe((response) => {
		});
	}

	private deleteReport(id): void {
		this.http.delete({
			'path': 'reports/'+id
		}).subscribe((response) => {
		});
	}

	public gotoPage(input: string) {
		this.router.navigate(['app/board', input]);
	}

	private loadReports(filter? : string | null): void {
		this.ifilter = filter;
		var query = new loopback();
		query.filter.include.push({ relation : "folder"},{ relation : "user"}, { relation : "state"} , { relation : "section"} )
		query.filter.where['folderId'] =  this.icurrentObj.currentFolder; //"5e024997b8287319151c688c";
		query.filter.where['stateId'] =  this.icurrentObj.currentState; //"5e024bcab8287319151c6897"
		query.filter.where['trash'] = this.icurrentObj.deletedFg;
		this.ifilter ? query.filter.where['name'] = {like:this.ifilter} : null ;
		this.http.get({
			path: 'reports?' + qs.stringify(query, {skipNulls: true})
		}).subscribe((response) => {
			this.list.reports = response.body;
		});
	}

	public filterReports(text: string) {
		this.loadReports(text);
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
		
		let clone = Object.assign({} , this.list.reports[pos]);
		clone.name = clone.name + ' Copia';
		clone.slug = clone.slug +'-copia';
		this.list.reports.splice(pos+1,0,clone);

		let newReport: any = {
			name : clone.name,
			slug : clone.slug,
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
		this.list.reports.splice(pos,1);

		this.deleteReport(reportId);
	}

}

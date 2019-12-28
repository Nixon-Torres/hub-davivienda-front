
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';
import { CreateReportDialogComponent } from '../create-report-dialog/create-report-dialog.component';
import { Router } from '@angular/router';

@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})
export class RightContentComponent implements OnInit {
	public list: any = {
		'reports': []
	}

	constructor(
		public dialog: MatDialog,
		private router: Router,
		private http: HttpService
	) { }

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

	private loadReports(): void {
		this.http.get({
			'path': 'reports?filter[include][0][relation]=folder&filter[include][1][relation]=state&filter[include][2][relation]=section&filter[include][3][relation]=user'
		}).subscribe((response) => {
			this.list.reports = response.body;
		});
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

	public onCloneReport(event: Event, pos: number) {
		
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


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
			'path': 'reports?filter[include][0][relation]=folder&filter[include][1][relation]=user&filter[include][2][relation]=state&filter[include][3][relation]=section'
		}).subscribe((response) => {
			this.list.reports = response.body;
		});
	}

	private saveReport(clone): void {
		this.http.post({
			'path': 'reports',
			'data': clone
		}).subscribe((response) => {
			console.log(response);
		});
	}

	public gotoPage(input: string) {
		this.router.navigate(['app/board', input]);
	}

	public onCloneReport(event: Event, pos: number) {

		let clone = Object.assign({} , this.list.reports[pos]);
		clone.name = clone.name + ' Copia';
		clone.slug = clone.slug +'-copia';
		clone.id = this.getId();
		this.list.reports.splice(pos+1,0,clone);

		//this.saveReport(clone);
	}

	public onDeleteReport(event: Event, pos: number) {
		this.list.reports.splice(pos,1);
	}

	public getId () {
		var str = '';
		var ref = 'abcdefghijklmnopqrstuvwxyz0123456789';
		for (var i=0; i<24; i++)
			{
				str += ref.charAt(Math.floor(Math.random()*ref.length));
			}
		return str;	
	}

}

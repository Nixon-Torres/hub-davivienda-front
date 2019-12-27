import { NgModule, Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';

@Component({
	selector: 'app-create-report-dialog',
	templateUrl: './create-report-dialog.component.html',
	styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<CreateReportDialogComponent>,
		private http: HttpService
	){}

	public authors = [
		{
			'name' : 'Andres Villanueva',
			'charge': 'Analista Contenido',
			'photo': 'profile.png' 
		} 
	]
	public selectedAuthor: string = '';	

	public list: any = {
		sections: [],
		typeSections: [],
		authors: this.authors,
		templates: [],
		users :[]
	}	

	ngOnInit() {
		this.loadSections();
		this.loadUsers();
		this.loadTemplates();
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	private loadSections() {
		this.http.get({
			'path': 'sections'
		}).subscribe((response) => {
			this.list.sections = response.body;
		});
	}

	private loadUsers() {
		this.http.get({
			'path': 'users'
		}).subscribe((response) => {
			this.list.users = response.body;
		});
	}

	private loadTemplates() {
		this.http.get({
			'path': 'templates'
		}).subscribe((response) => {
			console.log(response.body);
			this.list.templates = response.body;
		});
	}

	private onUpdateTypes($event,index) {
		this.list.typeSections = this.list.sections[index].types;
	}

	private onAddAuthor() {
		if (this.selectedAuthor)
			this.list.authors.push(this.list.users[this.selectedAuthor]); 
	}

	private onDeleteAuthor(pos) {
		if (this.selectedAuthor)
			this.list.authors.splice(pos,1);

	}

	private onOptionsSelected($event) {
		this.selectedAuthor;
	}

}

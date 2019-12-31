import { NgModule, Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HttpService } from '../../../../services/http.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-create-report-dialog',
	templateUrl: './create-report-dialog.component.html',
	styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {
	public exampleData = [];

	constructor(
		public dialogRef: MatDialogRef<CreateReportDialogComponent>,
		private http: HttpService,
		private router: Router
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

		this.exampleData = [
			{
			  id: 'basic1',
			  text: 'Basic 1'
			},
			{
			  id: 'basic2',
			  text: 'Basic 2'
			},
			{
			  id: 'basic3',
			  text: 'Basic 3'
			},
			{
			  id: 'basic4',
			  text: 'Basic 4'
			}
		  ];


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
			this.list.templates = response.body;
		});
	}

	public onUpdateTypes($event,index) {
		this.list.typeSections = this.list.sections[index].types;
	}

	public onAddAuthor() {
		if (this.selectedAuthor)
			this.list.authors.push(this.list.users[this.selectedAuthor]); 
	}

	public onDeleteAuthor(pos) {
		if (this.selectedAuthor)
			this.list.authors.splice(pos,1);

	}

	public onOptionsSelected($event) {
		this.selectedAuthor;
	}

	public gotoPage() {
		this.router.navigate(['app/board']);	
	} 

}

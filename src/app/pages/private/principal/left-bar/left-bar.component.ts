
import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';


@Component({
	selector: 'app-left-bar',
	templateUrl: './left-bar.component.html',
	styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {
	
	public list: any = {
		folders: [],
		states: []
	}

	constructor(
		private http: HttpService,
		public dialog: MatDialog
	) { }

	openDialog(): void {
		const dialogRef = this.dialog.open(DialogBoxComponent, {
			width: '600px',
			height: 'auto',
			maxHeight: '500px'
		});

		dialogRef.afterClosed().subscribe(result => {
			console.log('The dialog was closed');
		});
  	} 

	ngOnInit() {
		this.loadFolders();
		this.loadStates();
	}

	private loadFolders() {
		this.http.get({
			'path': 'folders'
		}).subscribe((response) => {
			this.list.folders = response.body;
		});
	}

    private loadStates() {
        this.http.get({
            'path': 'states'
        }).subscribe((response) => {
            this.list.states = response.body;
        });
    }

}

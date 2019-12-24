import { Component, OnInit, Inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export class Folder {
	id: string;
	name: string;
	icon: string;
	author: number;
}

@Component({
	selector: 'app-dialog-box',
	templateUrl: './dialog-box.component.html',
	styleUrls: ['./dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {

	public folders:any[] = [];
	public name:string = '';
	public edit:boolean = false;
	public currentPosition:number = 0;

	constructor(
		public dialogRef: MatDialogRef<DialogBoxComponent>,
		@Inject(MAT_DIALOG_DATA) data) {
		this.folders = data
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSaveFolder(event: Event): void {
		event.preventDefault();
		if (this.name != '') {
			if (!this.edit)
				this.folders.unshift({"id":"","name":this.name,"icon":"2","author":1});	
			else {
				this.folders[this.currentPosition].name = this.name;
				this.edit = false;
				this.currentPosition = 0;
			} 
			this.name = '';
		} 
	}

	onDeleteFolder(event: Event, pos: number): void {
		this.folders.splice(pos,1);	
	}

	onEditFolder(event: Event, pos:number): void {
		this.currentPosition = pos;
		this.edit = true;
		this.name = this.folders[pos].name;
	}

	ngOnInit() {
		console.log(this.dialogRef);
	}

}

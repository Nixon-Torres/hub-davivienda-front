
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})

export class RightContentComponent implements OnInit {

	private collapse: boolean = true;

	constructor() { }

	ngOnInit() {
	}

	public setHide() {
		this.collapse = this.collapse === false ? true : false;
	}

	public  isHide() {
		return this.collapse;
	}

}

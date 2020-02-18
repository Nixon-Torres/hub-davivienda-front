import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { AuthService } from '../../../../services/auth.service';
import { loopback } from '../../../../models/common/loopback.model';


@Component({
  selector: 'app-left-bar',
  templateUrl: './left-bar.component.html',
  styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {

	public list: any = {
		groups: []
	}

	private idCurrentGroup: any;

	constructor(
		private http: HttpService,
		private auth: AuthService
	) {}

	ngOnInit() {
		this.getGroups();
	}

	private getGroups() {
		let query = new loopback();
		query.filter.include.push([{ relation: 'users', scope: {type: 'count'}}]);
		this.http.get({
			path: `usersGroup`,
			data: query.filter,
			encode: true
		}).subscribe((response: any) => {
			console.log(response.body);
			this.list.groups = response.body;
		});
	}

	public setActive(id) {
		this.idCurrentGroup = id;
	}

	public isActive(id) {
		return this.idCurrentGroup === id;
	}	 

}

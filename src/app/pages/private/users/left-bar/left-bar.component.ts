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

	private static ROLE: String = 'Admin';

	public list: any = {
		groups: []
	}

	private idCurrentGroup: any;
	public user: any = {};
	public showGruopsUser: boolean;

	constructor(
		private http: HttpService,
		private auth: AuthService
	) {
		this.user = this.auth.getUserData();
		this.setActive(this.user.id);
	}

	ngOnInit() {
		this.setShowGruopsUser();
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
			this.list.groups = response.body;
		});
	}

	public setActive(id) {
		this.idCurrentGroup = id;
	}

	public isActive(id) {
		return this.idCurrentGroup === id;
	}

	public setShowGruopsUser() {
		let found = this.user.roles.find(element => element === LeftBarComponent.ROLE);
		this.showGruopsUser = found === undefined ? false : true ;
		return this.showGruopsUser;
	}	 	

}

import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../../services/users.service';

@Component({
	selector: 'app-right-content',
	templateUrl: './right-content.component.html',
	styleUrls: ['./right-content.component.scss']
})

export class RightContentComponent implements OnInit {

	private collapse: boolean = true;
	private profile: boolean = true;
	private profileSuscription: any;
	private nameGroup: String = 'Perfil Administrador';
	private nameGroupSuscription: any;

	constructor(
		private users: UsersService
	) { }

	ngOnInit() {
		this.showProfile();
		this.setNameGroup();
	}

	ngOnDestroy() {
		this.profileSuscription.unsubscribe();
		this.nameGroupSuscription.unsubscribe();
	}

	public setHide() {
		this.collapse = this.collapse === false ? true : false;
	}

	public  isHide() {
		return this.collapse;
	}

	public showProfile () {
		this.profileSuscription = this.users.getShowProfile().subscribe((response:any) => {
			this.profile = response;
		});
	}

	public setNameGroup () {
		this.nameGroupSuscription = this.users.getNameGroup().subscribe((response:any) => {
			this.nameGroup = response;
		});
	}



}

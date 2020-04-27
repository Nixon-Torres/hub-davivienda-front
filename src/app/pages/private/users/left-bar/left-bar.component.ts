import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {AuthService} from '../../../../services/auth.service';
import {loopback} from '../../../../models/common/loopback.model';
import {UsersService} from '../../../../services/users.service';

@Component({
    selector: 'app-left-bar',
    templateUrl: './left-bar.component.html',
    styleUrls: ['./left-bar.component.scss']
})
export class LeftBarComponent implements OnInit {

    private static ROLE: String = 'Admin';
    private static TITLE: String = 'Perfil Administrador';

    public list: any = {
        groups: []
    };

    private idCurrentGroup: any;
    public user: any = {};
    public showGruopsUser: boolean;

    constructor(
        private http: HttpService,
        private auth: AuthService,
        private users: UsersService
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;
        });
        this.setActive(this.user.id);
    }

    ngOnInit() {
        this.setShowGruopsUser();
        this.getGroups();
    }

    private getGroups() {
        let query = new loopback();
        query.filter.include.push(
            [{
                relation: 'users',
                scope: {
                    type: 'count',
                    include: 'files'
                }
            }]);
        this.http.get({
            path: `usersGroup`,
            data: query.filter,
            encode: true
        }).subscribe((response: any) => {
            this.list.groups = response.body;
        });
    }

    public setActive(id) {
        const value = id === this.user.id;
        const name = value === true ? LeftBarComponent.TITLE : this.getName(id);
        this.idCurrentGroup = id;
        this.users.setShowProfile(value);
        this.users.setNameGroup(name);
        if (!value) {
            this.setCurrentUsersGroup(id);
        }
    }

    public getName(id) {
        let found = this.list.groups.find(element => element.id === id);
        return found.name;
    }

    public isActive(id) {
        return this.idCurrentGroup === id;
    }

    public setShowGruopsUser() {
        let found = this.user.roles.find(element => element === LeftBarComponent.ROLE);
        this.showGruopsUser = found === undefined ? false : true;
        return this.showGruopsUser;
    }

    public setCurrentUsersGroup(id) {
        let found = this.list.groups.find(element => element.id === id);
        this.users.setCurrentUsersGroup(found.users);
    }

}

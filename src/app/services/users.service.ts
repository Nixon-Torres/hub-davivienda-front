import {Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private showProfile = new Subject<void>();
    public $showProfile = this.showProfile.asObservable();
    private nameGroup = new Subject<void>();
    public $nameGroup = this.nameGroup.asObservable();
    private currentUsersGroup = new Subject<void>();
    public $currentUsersGroup = this.currentUsersGroup.asObservable();

    constructor() {
    }

    public setShowProfile(value) {
        this.showProfile.next(value);
    }

    public getShowProfile() {
        return this.$showProfile;
    }

    public setNameGroup(value) {
        this.nameGroup.next(value);
    }

    public getNameGroup() {
        return this.$nameGroup;
    }

    public setCurrentUsersGroup(data) {
        this.currentUsersGroup.next(data);
    }

    public getCurrentUsersGroup() {
        return this.$currentUsersGroup;
    }
}

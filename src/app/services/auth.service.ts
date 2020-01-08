import { Injectable } from '@angular/core';

declare var localStorage: any;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public currentUser: any;

    constructor() {
        this.currentUser = this.get('CurrentUser');
    }

    public set(name: string, val: string): void {
        localStorage.setItem(name, val);
    }

    public unset(name: string): void {
        localStorage.removeItem(name);
    }

    public get(name: string, json?: boolean): any {
        let val: any = localStorage.getItem(name);
        return json ? ((val) ? JSON.parse(val) : null) : val;
    }

}

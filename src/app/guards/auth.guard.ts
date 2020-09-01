import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot,
         RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import {map, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        private auth: AuthService,
        private router: Router
    ) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const isLoggedin = this.auth.isLoggedin();

        if (isLoggedin) {
            return true;
        }

        return this.auth.user.pipe(map((user: any) => {
            return !!(user && user.id);
        }), take(1));
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.isActive();
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.isActive();
    }

    private isActive(): boolean {
        const isLoggedin = this.auth.isLoggedin();
        if (!isLoggedin) {
            this.router.navigate(['/login']);
        }
        return isLoggedin;
    }
}

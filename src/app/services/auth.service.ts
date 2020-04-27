import { Injectable } from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs';

import { LoginContext, AccessTokenInterface, UserInterface } from './auth.service.model';
import { HttpService } from './http.service';
import { CookieStorage } from './storage/cookie.storage';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenName = '94a08da1fecbb6e8b46990538c7b50b2-*';
    public user: ReplaySubject<any>;
    public loggedIn = false;

    constructor(
        private cookie: CookieStorage,
        private http: HttpService
    ) {
        this.user = new ReplaySubject<any>(1);
        // this.http.setAuthorization('6Wk3eaWAH693rlbXjc418JiBOAvMbslU1yybTCEVOnbQ47HwNLgkHRz9bgc61egg');
        this.reloadUser();
    }

    public isLoggedin(): any {
        return this.loggedIn;
    }

    public setUser(user: any): void {
        this.user.next(user);
    }

    public setUserData(attr: string, value: boolean): any {
        this.user.subscribe((user) => {
            user[attr] = value;
            this.user.next(user);
        });
    }

    public isMarketing(): any {
        const roles = []; // this.getUserData('roles');
        return !!(roles && roles.find((role) => role === 'marketing'));
    }

    public isBasicUser(): any {
        const roles = []; // this.getUserData('roles');
        return !(roles && roles.find((role) => (role === 'Admin' || role === 'medium')));
    }

    public login(context: LoginContext): Observable<any> {
        return new Observable((observer) => {
            this.getToken(context, (error: any, token: AccessTokenInterface) => {
                if (error) {
                    observer.error(error);
                    observer.complete();
                    return;
                }
                this.getCurrentUser(token.userId, (err: any, user: UserInterface) => {
                    if (err) {
                        observer.error(err);
                        observer.complete();
                        return;
                    }
                    this.loggedIn = true;
                    this.user.next(user);
                    observer.next(true);
                    observer.complete();
                });
            });
        });
    }

    public logout(): Observable<any> {
        return new Observable((observer) => {
            this.removeToken((error: any) => {
                if (error) {
                    observer.error(error);
                    observer.complete();
                    return;
                }
                this.user.next(null);
                observer.next(true);
                observer.complete();
            });
        });
    }

    private getToken(input: any, fn: any) {
        this.http.post({ path: 'users/login', data: input }).subscribe(
            (response: any) => {
                fn(null, response.body);
            },
            (error) => {
                fn(error, null);
            }
        );
    }

    private removeToken(fn: any) {
        this.http.post({
            path: 'users/logout'
        }).subscribe(
            (response: any) => {
                fn(null, response.body);
            },
            (error) => {
                fn(error, null);
            }
        );
    }

    public reloadUser() {
        this.http.get({
            path: `me`,
        }).subscribe((res: any) => {
            const user = res.body;
            this.http.get({
                path: `users/${user.id}`,
                data: {
                    include: ['files']
                },
                encode: true
            }).subscribe(
                (response: any) => {
                    const nuser = response.body;
                    nuser.roles = user.roles;

                    if (user && nuser) {
                        this.loggedIn = true;
                    }

                    this.user.next(nuser);
                },
                (error) => {
                    console.log(error);
                }
            );
        });
    }

    private getCurrentUser(userId?: string, fn?: any) {
        userId = userId ? userId : null;
        this.http.get({
            path: `users/${userId}`,
            data: {
                include: ['files']
            },
            encode: true
        }).subscribe(
            (response: any) => {
                const body = response.body;
                this.http.get({ path: 'me' }).subscribe(
                    (res: any) => {
                        body.roles = res.body.roles;
                        if (fn) { fn(null, body); }
                    }, (error) => {
                        if (fn) { fn(error, null); }
                    }
                );
            },
            (error) => {
                if (fn) { fn(error, null); }
            }
        );
    }
}

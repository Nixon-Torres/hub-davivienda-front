import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginContext, AccessTokenInterface, UserInterface } from './auth.service.model';
import { HttpService } from './http.service';
import { CookieStorage } from './storage/cookie.storage';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenName = '94a08da1fecbb6e8b46990538c7b50b2-*';

    constructor(
        private cookie: CookieStorage,
        private http: HttpService
    ) {
        this.setAuthorization();
    }

    public isLoggedin(): any {
        let token = this.get();
        return token ? true : false;
    }

    public getUserData(attr?: string): any {
        let token = this.get();
        return (token ? (attr ? token.user[attr] : token.user) : {});
    }

    public login(context: LoginContext): Observable<any> {
        return new Observable((observer) => {
            this.getToken(context, (error: any, token: AccessTokenInterface) => {
                if (error) {
                    observer.error(error);
                    observer.complete();
                    return;
                }
                this.set(token);
                this.getCurrentUser(token.userId, (err: any, user: UserInterface) => {
                    if (err) {
                        observer.error(err);
                        observer.complete();
                        return;
                    }
                    token.user = user;
                    this.set(token);
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
                this.clear();
                observer.next(true);
                observer.complete();
            });
        });
    }

    private getToken(input: any, fn: any) {
        this.http.post({ 'path': 'Users/login', 'data': input }).subscribe(
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
            'path': 'Users/logout', 'data': {
                'access_token': this.http.authorization
            }
        }).subscribe(
            (response: any) => {
                fn(null, response.body);
            },
            (error) => {
                fn(error, null);
            }
        );
    }

    private getCurrentUser(userId?: string, fn?: any) {
        userId = userId ? userId : null;
        this.http.get({ 'path': `Users/${userId}`, 'data': {} }).subscribe(
            (response: any) => {
                fn(null, response.body);
            },
            (error) => {
                fn(error, null);
            }
        );
    }

    private setAuthorization(): void {
        let token = this.get();
        if (token) {
            this.http.authorization = token.id;
        } else {
            this.http.authorization = null;
        }
    }

    private get(): any {
        let token = this.cookie.get(this.tokenName);
        return (typeof (token) == 'string') ? JSON.parse(token) : token;
    }

    private set(token: any): void {
        this.cookie.set(this.tokenName, JSON.stringify(token));
        this.setAuthorization();
    }

    private clear(): void {
        this.cookie.remove(this.tokenName);
        this.setAuthorization();
    }
}

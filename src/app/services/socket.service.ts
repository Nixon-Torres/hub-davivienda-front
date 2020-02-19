import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

import io from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private _URL_SOCKET = environment.URL_SOCKET;
    private socket: any = null;

    constructor(
        private auth: AuthService
    ) { }

    public on(nsp: string): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            this.socket.on(nsp, (response: any) => {
                observer.next(response);
            });
        });
    }

    public emit(nsp: string, data?: any): Observable<any> {
        data = data || {};
        return new Observable((observer: Observer<any>) => {
            this.socket.emit(nsp, data, (response: any) => {
                observer.next(response);
            });
        });
    }

    public start(): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            if (!this.auth.isLoggedin()) {
                observer.error('Error: forbiden');
                observer.complete();
                return;
            };
            this.connect((isConnected: boolean) => {
                this.authenticate();
                this.on('authenticated').subscribe(
                    (isAuthenticated: boolean) => observer.next(isConnected && isAuthenticated)
                );
            });
        });
    }

    public removeListener(nsp: string): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            this.socket.off(nsp, (response: any) => {
                observer.next(response);
            });
        });
    }

    private connect(fn: Function): void {
        if (!this.socket) {
            this.socket = io(this._URL_SOCKET);
            this.socket.on('connect', () => fn(true));
        } else if (this.socket && !this.socket.connected) {
            if (this.socket.off) this.socket.off();
            if (this.socket.destroy) this.socket.destroy();
            delete this.socket;
            this.connect(fn);
        }
    }

    private authenticate(): void {
        let authorization = this.auth.getAuthorization();
        let userId = this.auth.getUserData('id');
        this.socket.emit('authentication', {
            id: authorization,
            userId: userId
        });
    }
}

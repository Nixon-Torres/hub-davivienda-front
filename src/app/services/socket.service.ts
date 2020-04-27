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
    public user: any;

    constructor(
        private auth: AuthService
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;
        });
    }

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
                observer.error('Error: forbidden');
                observer.complete();
                return;
            }
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

    private connect(fn: (param: boolean) => void): void {
        if (!this.socket) {
            this.socket = io(this._URL_SOCKET);
            this.socket.on('connect', () => fn(true));
        } else if (this.socket && !this.socket.connected) {
            if (this.socket.off) { this.socket.off(); }
            if (this.socket.destroy) { this.socket.destroy(); }
            delete this.socket;
            this.connect(fn);
        }
    }

    private authenticate(): void {
        const userId = this.user.id;
        this.socket.emit('authentication', {
            userId
        });
    }
}

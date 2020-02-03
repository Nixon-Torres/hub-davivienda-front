import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

import io from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private _URL_SOCKET = environment.URL_SOCKET;
    private socket: any;

    constructor(
        private auth: AuthService
    ) {
        this.startIo();
    }

    private startIo(): void {
        if (!this.auth.isLoggedin()) return;
        let authorization = this.auth.getAuthorization();
        let userId = this.auth.getUserData('id');

        this.socket = io(this._URL_SOCKET);
        this.socket.on('connect', () => {
            this.socket.emit('authentication', {
                id: authorization,
                userId: userId
            });
            this.socket.on('authenticated', () => {
                console.log('User is authenticated!!!');
            });
        });
    }
}

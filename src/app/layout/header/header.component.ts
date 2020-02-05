import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd   } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { SocketService } from '../../services/socket.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
    public user: any = {};
    public ntfQty: number = 0;
    public onPrincipal: boolean = false;
    public notifications: any = [];

    constructor(
        private router: Router,
        private auth: AuthService,
        private http: HttpService,
        private socket: SocketService
    ) {
        this.user = this.auth.getUserData();
        this.startToListenRouter(this.router);
        this.startToListenSockets()
    }

    ngOnInit() {
        this.http.get({
            'path': `notifications`
        }).subscribe((response: any) => {
            console.log("response: ", response);
            if ("body" in response) {
                let unprocessedData = response.body;
                this.processNotificationsData(unprocessedData);
                this.countNotifications();
                console.log("r", this.notifications);
            }
        });
    }

    private processNotificationsData(unprocessedData: any) {
        unprocessedData.map(item => {
            let processedItem = {
                type: item.type,
                title: item.type === 'report-comment' ? 'COMENTARIOS' : 'INFORME',
                description: "Julano ha dejado coentarios sobre el informe Estados financieros",
                timeAgo: "Hace 2 horas",
                readed: item.readed
            };
            this.notifications.push(processedItem);
        });
    }

    private startToListenSockets() {
        this.socket.start().subscribe(() => {
            this.socket.on("notification").subscribe((response) => {
                this.notifications.push(response);
                this.countNotifications();
            });
        });
    }

    private countNotifications() {
        this.ntfQty = this.notifications.length;
    }

    private startToListenRouter(router: Router) {
        router.events.subscribe(event => {
            if(event instanceof NavigationEnd){
                let pageName = event.url.split("/")[2];
                this.onPrincipal = pageName === 'principal' ? true : false;
            }
        });
    }

    public logout() {
        this.auth.logout().subscribe((response: boolean) => {
            if (response) {
                this.router.navigate(['login']);
            }
        });
    }

    isOpened(evt: any) {
        let ntContainer = document.getElementById('notificationHeader').parentElement;
        ntContainer.classList.add('notifications');
    }
}

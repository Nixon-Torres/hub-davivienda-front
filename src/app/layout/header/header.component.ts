import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { SocketService } from '../../services/socket.service';

// import { loopback } from '../../models/common/loopback.model';
import * as moment from 'moment';

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
    private stateColors: any = {
        '5e068c81d811c55eb40d14d0': 'bg-publish',
        '5e068d1cb81d1c5f29b62974': 'bg-approved',
        '5e068d1cb81d1c5f29b62975': 'bg-reviewed',
        '5e068d1cb81d1c5f29b62976': 'bg-toReview',
        '5e068d1cb81d1c5f29b62977': 'bg-draft'
    };

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
        moment.locale('es'); // Set locale lang for momentJs
        this.getNotifications();
        this.getCountNotifications();
    }

    private getNotifications(): void {
     this.http.get({
            'path': `notifications`,
            'data': {
                order: 'id DESC',
                include: [
                    { relation: "emitter", scope: { fields: ['name'] } },
                    { relation: "report", scope: { fields: ['name', 'stateId'] } }
                ],
                where: { ownerId: this.user.id },
                limit: 10
            },
            'encode': true
        }).subscribe((response: any) => {
            if ("body" in response) {
                response.body.map( notification => { this.processNotification(notification) });
            }
        });
    }

    private getCountNotifications(): void {
        this.http.get({
            'path': `notifications/count?where=`,
            'data': {
                ownerId: this.user.id,
                readed: false
            }
        }).subscribe((response: any) => {
            if ("body" in response) {
               this.ntfQty = response.body.count;
            }
        });
    }

    private startToListenSockets() {
        this.socket.start().subscribe(() => {

            // If listen a new notification for be processed and get qty of notifications unreaded
            this.socket.on("notification").subscribe((response) => {
                this.processNotification(response);
                this.getCountNotifications();
                this.notifications.sort((a, b) => a.id < b.id ? 1 : ( a > b) ? -1 : 0);
            });

            // If listen when a notification was readed, get all notifications again and and their qty
            this.socket.on("readed").subscribe(() => {
                this.getNotifications();
                this.getCountNotifications();
            });
        });
    }

    private processNotification(item: any) {
        let timeFromNow: string = moment(item.updatedAt).fromNow();
        let txtDescription: string = item.text
                                    .replace(/{{emitter_name}}/, item.emitter.name)
                                    .replace(/{{report_name}}/, item.report.name);
        let notf: any = {
            id: item.id,
            type: item.type,
            subject: item.subject,
            text: txtDescription,
            timeAgo: timeFromNow,
            readed: item.readed,
            reportId: item.reportId
        };

        if (item.type !== "report-comment" && "report" in item && "stateId" in item.report) {
            notf.bgColor = this.stateColors[item.report.stateId] || 'bg-default';
        }

        this.notifications.push(notf);
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

    openNotf(reportId: number, readed: boolean) {
        this.getCountNotifications();
        this.notifications.filter((a) => {
            if(a.reportId == reportId) {
                a.readed = true;
            }
            return true;
        });
        this.router.navigate(['app/board', reportId]);
    }
}

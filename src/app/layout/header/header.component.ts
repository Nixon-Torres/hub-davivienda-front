import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { SocketService } from '../../services/socket.service';

import { loopback } from '../../models/common/loopback.model';
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
        var query = new loopback();

        query.filter.include = [{
                relation: "owner",
                scope: {
                    fields: ['name', 'tales']
                }
            },{
                relation: "emitter",
                scope: {
                    fields: ['name', 'tales']
                }
            },{
                relation: "report",
                scope: {
                    fields: ['name', 'tales']
                }
            } //, {
            //     relation: "comment",
            //     scope: {
            //         fields: ['name', 'tales']
            //     }
            // }
        ];

        this.http.get({
            'path': `notifications`,
            'data': query.filter,
            'encode': true
        }).subscribe((response: any) => {
            if ("body" in response) {
                response.body.map( notification => { this.processNotification(notification) });
                this.countNotifications();
            }
        });
    }

    private startToListenSockets() {
        this.socket.start().subscribe(() => {
            this.socket.on("notification").subscribe((response) => {
                this.processNotification(response);
                this.countNotifications();
            });
        });
    }

    private processNotification(item: any) {

        let timeFromNow: string = moment(item.updatedAt).fromNow();
        let existReport: boolean = "report" in item && "name" in item.report ? true : false;
        let existEmitter: boolean = "emitter" in item && "name" in item.emitter ? true : false;

        let notf: any = {
            type: item.type,
            timeAgo: timeFromNow[0].toUpperCase() + timeFromNow.slice(1),
            readed: item.readed,
            reportId: item.reportId
        };

        switch (item.type) {
            case "report-comment":
                notf.title = 'COMENTARIOS';
                notf.description =  existEmitter ? `${item.emitter.name} ha dejado` : 'Han dejado';
                notf.description += " un comentario en ";
                notf.description +=  existReport ? `el informe ${item.report.name}` : 'un informe';
                break;

            case "report":
                notf.title = 'INFORME';
                notf.description = existReport ? `El informe ${item.report.name}` : 'Un informe';
                notf.description += " ha sido actualizado";
                break;

            default:
                notf.title = 'GENERAL';
                break;
        }

        this.notifications.push(notf);
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

    openNotf(reportId: number) {
        this.notifications.filter((a) => {
            if(a.reportId == reportId) {
                a.readed = true;
            }
            return true;
        });
        this.router.navigate(['app/board', reportId]);
    }
}

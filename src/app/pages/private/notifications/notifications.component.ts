import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../../../services/http.service';
import { SocketService } from '../../../services/socket.service';

import * as moment from 'moment';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit {
	
	public ntfQty: number = 0;
	public notifications: any = [];

	constructor (
        private router: Router,
		private http: HttpService,
        private socket: SocketService
	) {
        this.startToListenSockets()
	}

	ngOnInit() {

        this.http.get({
            'path': `notifications`,
            'data': {
                order: 'id DESC',
                include: [
                    { relation: "emitter", scope: { fields: ['name'] } },
                    { relation: "report", scope: { fields: ['name', 'stateId'] } }
                ]
            },
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

    public openNotification(reportId) {
        this.router.navigate(['app/board', reportId]);
    }

}
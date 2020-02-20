import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { SocketService } from '../../../services/socket.service';

import * as moment from 'moment';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit {
	public user: any = {};
	public ntfQty: number = 0;
	public notifications: any = [];
    private stateColors: any = {
        '5e068c81d811c55eb40d14d0': 'bg-publish',
        '5e068d1cb81d1c5f29b62974': 'bg-approved',
        '5e068d1cb81d1c5f29b62975': 'bg-reviewed',
        '5e068d1cb81d1c5f29b62976': 'bg-toReview',
        '5e068d1cb81d1c5f29b62977': 'bg-draft'
    };

	constructor (
        private router: Router,
        private location: Location,
        private auth: AuthService,
		private http: HttpService,
        private socket: SocketService
	) {
        this.startToListenSockets()
        this.user = this.auth.getUserData();
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
                this.getCountNotifications();
            }
        });
	}

	private startToListenSockets() {
        this.socket.start().subscribe(() => {
            this.socket.on("notification").subscribe((response) => {
                this.processNotification(response);
                this.getCountNotifications();
            });
        });
    }

    private processNotification(item: any) {
        console.log("item: ", item);
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

    public openNotification(reportId) {
        this.router.navigate(['app/board', reportId]);
    }

    public goBack() {
        this.location.back();
    }

}
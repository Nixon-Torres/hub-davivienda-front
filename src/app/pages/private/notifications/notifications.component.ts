import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';

import {AuthService} from '../../../services/auth.service';
import {HttpService} from '../../../services/http.service';
import {SocketService} from '../../../services/socket.service';

import * as moment from 'moment';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit {
    public user: any = {};
    public ntfQty = 0;
    public commentsQty = 0;
    public othersQty = 0;
    public publishedOthersQty = 0;
    public currentTab = 1;
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
        private location: Location,
        private auth: AuthService,
        private http: HttpService,
        private socket: SocketService
    ) {
        // this.startToListenSockets() // TODO refactory this service for panel
        this.user = this.auth.getUserData();
    }

    ngOnInit() {
        this.getNotifications();
        this.getCountNotifications();
        const _this = this;
        const ntfContainer = document.getElementsByClassName('mat-card-container')[0];
        ntfContainer.addEventListener('scroll', function(e) {
            if ((this.scrollHeight - this.scrollTop) === this.offsetHeight) {
                document.getElementsByClassName('loader')[0].classList.remove('hide');
                _this.getNotifications();
            }
        });
    }

    isActive(idx) {
        return this.currentTab === idx;
    }

    setActive(idx) {
        this.notifications = [];
        this.currentTab = idx;
        this.getNotifications();
    }

    getWhere(idx) {
        const where: any = {};

        where.ownerId = this.user.id;
        if (idx === 2) {
            where.type = 'report-comment';
        } else if (idx === 3) {
            where.type = 'report-edited';
        } else if (idx === 4) {
            where.reportStateId = '5e068c81d811c55eb40d14d0';
        }
        return where;
    }

    private getNotifications() {
        this.http.get({
            path: `notifications`,
            data: {
                order: 'id DESC',
                include: [
                    {relation: 'emitter', scope: {fields: ['name']}},
                    {relation: 'report', scope: {fields: ['name', 'stateId']}}
                ],
                where: this.getWhere(this.currentTab),
                limit: 15,
                skip: this.notifications.length
            },
            encode: true
        }).subscribe((response: any) => {
            document.getElementsByClassName('loader')[0].classList.add('hide');
            const notifications = response.body as any;
            notifications.forEach(notification => {
                this.processNotification(notification);
            });
        });
    }

    private getCountNotifications(): void {
        this.http.get({
            path: `notifications/count?where=`,
            data: {
                ownerId: this.user.id,
                readed: false
            }
        }).subscribe((response: any) => {
            this.ntfQty = response.body.count;
        });

        this.http.get({
            path: `notifications/count?where=`,
            data: this.getWhere(2)
        }).subscribe((response: any) => {
            this.commentsQty = response.body.count;
        });

        this.http.get({
            path: `notifications/count?where=`,
            data: this.getWhere(3)
        }).subscribe((response: any) => {
            this.othersQty = response.body.count;
        });

        this.http.get({
            path: `notifications/count?where=`,
            data: this.getWhere(4)
        }).subscribe((response: any) => {
            this.publishedOthersQty = response.body.count;
        });
    }

    private processNotification(item: any) {
        const timeFromNow: string = moment(item.updatedAt).fromNow();
        const txtDescription: string = item.text
            .replace(/{{emitter_name}}/, item.emitter ? item.emitter.name : 'Desconocido')
            .replace(/{{report_name}}/, item.report ? item.report.name : 'Desconocido');
        const notf: any = {
            id: item.id,
            type: item.type,
            subject: item.subject,
            text: txtDescription,
            timeAgo: timeFromNow,
            readed: item.readed,
            reportId: item.reportId
        };

        if (item.type !== 'report-comment' && 'report' in item && 'stateId' in item.report) {
            notf.bgColor = this.stateColors[item.reportStateId] || 'bg-default';
        }

        this.notifications.push(notf);
    }

    private startToListenSockets() {
        this.socket.start().subscribe(() => {
            this.socket.on('notification').subscribe((response) => {
                this.processNotification(response);
                this.getCountNotifications();
            });
        });
    }

    public openNotification(reportId) {
        this.router.navigate(['app/board', reportId]);
    }

    public goBack() {
        this.location.back();
    }

}

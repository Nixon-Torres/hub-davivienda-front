import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit {

	constructor(private http: HttpService) { }

	ngOnInit() {
		this.http.get({
            'path': `notifications`,
            // 'data': { type: "count"},
            // 'encode': true
        }).subscribe((response: any) => {
            console.log("response2: ", response);
        });
	}

}
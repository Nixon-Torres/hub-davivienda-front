import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd   } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public user: any = {};
    public onPrincipal: boolean = false;

    constructor(
        private router: Router,
        private auth: AuthService
    ) {
        this.user = this.auth.getUserData();
        this.routerEvent(this.router);
    }

    ngOnInit() {}

    private routerEvent(router: Router) {
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

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
    public onBoard: boolean = false;

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
                this.onBoard = pageName === 'board' ? true : false;
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
}

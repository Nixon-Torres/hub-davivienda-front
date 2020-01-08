import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public user: any = {};

    constructor(
        private router: Router,
        private auth: AuthService
    ) {
        this.user = this.auth.getUserData();
    }

    ngOnInit() {
    }

    public logout() {
        this.auth.logout().subscribe((response: boolean) => {
            if (response) {
                this.router.navigate(['login']);
            }
        });
    }

}

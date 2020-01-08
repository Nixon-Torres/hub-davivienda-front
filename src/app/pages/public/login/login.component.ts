import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;

    constructor(
        private router: Router,
        private http: HttpService,
        private auth: AuthService
    ) { }

    ngOnInit() {
        this.initFormLogin();
    }

    public initFormLogin(): void {
        this.loginForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
    }

    public login(): void {
        this.http.post({
            'path': 'Users/login',
            'data': {
                'email': this.loginForm.value.email,
                'password': this.loginForm.value.password
            }
        }).subscribe((response: any) => {
            this.auth.set('Authorization', response.body.id);
            this.http.get({
                'path': 'Users/' + response.body.userId,
                'data': {}
            }).subscribe((userResponse: any) => {
                let user: any = userResponse.body;
                user.auth = response.body.id;
                this.auth.set('CurrentUser', JSON.stringify(user));
                this.router.navigate(['app/principal']);
            });
        });
    }

}

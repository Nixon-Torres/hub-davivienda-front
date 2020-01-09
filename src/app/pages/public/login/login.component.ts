import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    public showErrorMsg: boolean;

    constructor(
        private router: Router,
        private auth: AuthService
    ) { }

    ngOnInit() {
        this.initFormLogin();
    }

    public initFormLogin(): void {
        this.loginForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            remember: new FormControl(false)
        });
    }

    public login() {
        this.showErrorMsg = false;
        this.auth.login(this.loginForm.value).subscribe(
            (response: boolean) => {
                if(response) {
                    setTimeout(() => {
                        this.router.navigate(['app/principal']);
                    }, 100);
                }
            },
            () => {
                this.showErrorMsg = true;
            }
        );
    }

}

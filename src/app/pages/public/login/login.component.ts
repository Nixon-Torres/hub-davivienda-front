import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {AuthService} from '../../../services/auth.service';
import {UserInterface} from '../../../services/auth.service.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public loginForm: FormGroup;
    public doubleFactorForm: FormGroup;
    public showErrorMsg: boolean;
    public showFactor: boolean;
    public email: string;
    public classTwoFactor = 'log_validation';

    constructor(
        private router: Router,
        private auth: AuthService
    ) {
        this.showFactor = false;
        this.auth.user.subscribe((user) => {
            if (user && user.id) {
                this.router.navigate(['/app/principal']);
            }
        });
    }

    ngOnInit() {
        this.initFormLogin();
        this.initFormDoubleFactor();
    }

    public initFormLogin(): void {
        this.loginForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            remember: new FormControl(false)
        });
    }

    public initFormDoubleFactor(): void {
        this.doubleFactorForm = new FormGroup({
            field1: new FormControl('', Validators.required),
            field2: new FormControl('', Validators.required),
            field3: new FormControl('', Validators.required),
            field4: new FormControl('', Validators.required),
            field5: new FormControl('', Validators.required),
            field6: new FormControl('', Validators.required),
        });
    }

    public login() {
        this.showErrorMsg = false;
        this._removeClass();
        this.auth.login(this.loginForm.value).subscribe(
            (user: UserInterface) => {
                if (!!user.email) {
                    this.hiddenEmail(user.email);
                    this.showFactor = true;
                }
            },
            () => {
                this.showErrorMsg = true;
            }
        );
    }

    public hiddenEmail(email: string): void {
        const div = (email.split('@')[0].length / 2).toFixed();
        this.email = `xxxx${email.slice(parseInt(div, 10))}`;
    }

    public _verifyDoubleFactor() {
        let code = '';
        Object.values(this.doubleFactorForm.value).forEach((value) => {
            code += value;
        });
        this.auth.login(this.loginForm.value, code).subscribe(
            (user: UserInterface) => {
                if (!!user.id) {
                    this.classTwoFactor += ' valid';
                    setTimeout(() => {
                        this.router.navigate(['app/principal']);
                    }, 100);
                }
            },
            () => {
                this.classTwoFactor += ' invalid';
            }
        );
    }

    public _removeClass() {
        this.classTwoFactor = this.classTwoFactor.replace(' invalid', '');
    }

}

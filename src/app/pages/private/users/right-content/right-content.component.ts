import {Component, OnInit} from '@angular/core';
import {UsersService} from '../../../../services/users.service';
import {AuthService} from '../../../../services/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {GalleryDialogComponent} from '../../gallery-dialog/gallery-dialog.component';
import {ProfileFormComponent} from '../profile-form/profile-form.component';
import {UserFormComponent} from '../user-form/user-form.component';


@Component({
    selector: 'app-right-content',
    templateUrl: './right-content.component.html',
    styleUrls: ['./right-content.component.scss']
})

export class RightContentComponent implements OnInit {

    private collapse = true;
    public profile = true;
    private profileSuscription: any;
    public nameGroup = 'Perfil';
    private nameGroupSuscription: any;
    public currentUsersGroup: any = [];
    private currentUsersGroupSuscription: any;
    public user: any = [];
    private imageProfile: any;
    public canEdit = false;

    constructor(
        private auth: AuthService,
        private users: UsersService,
        public dialog: MatDialog
    ) {
        this.auth.user.subscribe((user) => {
            this.user = user;

            this.canEdit = this.user.roles.find(e => e === 'Admin') && !this.user.roles.find(e => e === 'medium');
        });
    }

    ngOnInit() {
        this.showProfile();
        this.setNameGroup();
        this.setcurrentUsersGroup();
    }

    ngOnDestroy() {
        this.profileSuscription.unsubscribe();
        this.nameGroupSuscription.unsubscribe();
        this.currentUsersGroupSuscription.unsubscribe();
    }

    public showProfile() {
        this.profileSuscription = this.users.getShowProfile().subscribe((response: any) => {
            this.profile = response;
        });
    }

    public setNameGroup() {
        this.nameGroupSuscription = this.users.getNameGroup().subscribe((response: any) => {
            this.nameGroup = response;
        });
    }

    public setcurrentUsersGroup() {
        this.currentUsersGroupSuscription = this.users.getCurrentUsersGroup().subscribe((response: any) => {
            this.currentUsersGroup = response;
        });
    }

    public openDialog(): void {
        const dialogRef = this.dialog.open(GalleryDialogComponent, {
            width: '900px',
            height: '500px'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result !== undefined) {
                this.imageProfile = result.data;
            }
        });
    }
}

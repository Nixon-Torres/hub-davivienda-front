import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../../services/http.service';
import {MatChipInputEvent} from '@angular/material/chips';
import {ConfirmationDialogComponent} from '../../board/confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {forkJoin} from 'rxjs';

export interface Company {
    name: string;
}

@Component({
    selector: 'app-edit-companies',
    templateUrl: './edit-companies.component.html',
    styleUrls: ['./edit-companies.component.scss']
})
export class EditCompaniesComponent implements OnInit {

    public list: any = {
        companies: []
    };

    public time = '';
    public name = '';

    public content: any = null;
    public showPanel: boolean;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    newCompanies: Company[] = [];
    toRemove = [];

    constructor(
        private http: HttpService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getCompanies();
        this.getContent();
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our Company
        if ((value || '').trim()) {
            this.newCompanies.push({name: value.trim()});
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(company: Company): void {
        const index = this.newCompanies.indexOf(company);

        if (index >= 0) {
            this.newCompanies.splice(index, 1);
        }
    }

    removeTop(company: Company): void {
        this.toRemove.push(company);

        const index = this.list.companies.indexOf(company);

        if (index >= 0) {
            this.list.companies.splice(index, 1);
        }
    }

    public onConfirmSave(): void {
        if (this.toRemove.length === 0) {
            return this.onSave();
        }

        const companiesToRemoveStr = '<div class="strong">' + this.toRemove.map(e => e.name).join('</br>') + '</div>';
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Esta seguro que desea eliminar el contenido<br/>' + companiesToRemoveStr,
                    twoButtons: true,
                    icon: 'icon-exclamation',
                    iconColor: '#FF003B',
                    mainButton: 'Si, Eliminar',
                    secondButton: 'Cancelar'
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                return this.onSave();
            }
            this.toRemove = [];
            this.getCompanies();
        });
    }

    public onSave(): void {
        let observables = this.toRemove.map((company) => {
            return this.http.delete({
                path: 'companies/' + company.id
            });
        });

        observables = observables.concat(this.newCompanies.map((company) => {
            return this.http.post({
                path: 'companies/',
                data: {
                    name: company.name
                }
            });
        }));

        forkJoin(observables).subscribe((response: any) => {
            this.showConfirmation(this.newCompanies);
            this.newCompanies = [];
            this.toRemove = [];
            this.getCompanies();
            this.showPanel = false;
            this.saveContent();
        }, (error: any) => {
            console.error(error);
        });
    }

    public getCompanies() {
        this.http.get({
            path: 'companies/'
        }).subscribe((response: any) => {
            this.list.companies = response.body;
        }, (error: any) => {
            console.error(error);
        });
    }

    public saveContent() {
        const id = this.content ? '/' + this.content.id : '';
        const verb = this.content ? 'patch' : 'post';

        this.http[verb]({
            path: 'contents' + id,
            data: {key: 'companiesKey'}
        }).subscribe((response: any) => {
            this.getContent();
            this.getCompanies();
        });
    }

    public getContent() {
        this.http.get({
            path: 'contents',
            data: {where: {key: 'companiesKey'}, include: ['lastUpdater']},
            encode: true
        }).subscribe((response) => {
            if ((response.body as unknown as []).length > 0) {
                this.name = response.body[0].lastUpdater.name;
                this.time = response.body[0].updatedAt;
                this.content = response.body[0];
            }
        });
    }

    public showConfirmation(companiesAdded: any) {
        if (companiesAdded.length === 0) {
            return;
        }

        const companiesAddedStr = '<strong>' + companiesAdded.map(e => e.name).join(', ') + '</strong>';

        this.dialog.open(ConfirmationDialogComponent, {
            width: '410px',
            data: {
                config: {
                    title: 'Las compañas ' + companiesAddedStr + ' se han agregado exitosamente.',
                    twoButtons: true,
                    icon: 'icon-check',
                    iconColor: '#19d600',
                    mainButton: 'Aceptar',
                    secondButton: 'Cancelar'
                }
            }
        });
    }
}

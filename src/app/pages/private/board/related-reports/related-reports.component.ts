import {Component, OnInit, Input} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {HttpService} from '../../../../services/http.service';

@Component({
    selector: 'app-related-reports',
    templateUrl: './related-reports.component.html',
    styleUrls: ['./related-reports.component.scss']
})

export class RelatedReportsComponent implements OnInit {

    @Input('reportId') private reportId: string;
    @Input('readOnly') public readOnly: boolean;

    public timer: any = {
        toRelated: null
    };
    public ifilter: string;
    public relatedReports: any = [];
    public foundedReports: any = [];

    constructor(
        private http: HttpService
    ) {
    }

    ngOnInit() {
        this.getRelatedReports();
    }

    public drop(event: CdkDragDrop<string[]>) {
        if (this.readOnly) {
            return;
        }
        moveItemInArray(this.relatedReports, event.previousIndex, event.currentIndex);
        this.relatedReports.map((val, ind) => {
            val.pos = ind;
            return val;
        });
        this.saveRelatations(this.relatedReports);
    }

    private getRelatedReports() {
        this.http.get({
            path: `reports/${this.reportId}/relateds`,
            data: {
                include: [
                    {
                        relation: 'related',
                        scope: {
                            fields: ['name']
                        }
                    }
                ],
                order: 'pos ASC'
            },
            encode: true
        }).subscribe((response: any) => {
            this.relatedReports = response.body.sort((a, b) => {
                if (!a.name || !b.name) {
                    return 0;
                }

                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                if (b.name.toLowerCase() > a.name.toLowerCase()) {
                    return -1;
                }
                return 0;
            });
        });
    }

    public searchReports(): void {
        if (this.timer.toRelated) {
            clearTimeout(this.timer.toRelated);
        }
        if ((this.ifilter && !this.ifilter.replace(/\s/g, '').length) || this.relatedReports.length >= 4) {
            this.foundedReports = [];
            this.ifilter = '';
            return;
        }

        this.timer.toRelated = setTimeout(() => {
            this.http.get({
                path: 'reports',
                data: {
                    fields: ['id', 'name'],
                    where: {
                        and: [{
                            id: {
                                nin: [this.reportId].concat(this.relatedReports.map((a: any) => a.relatedId))
                            },
                            name: {
                                like: this.ifilter, options: 'i'
                            },
                            trash: false
                        }]
                    },
                    order: 'name ASC'
                },
                encode: true
            }).subscribe((response: any) => {
                this.foundedReports = response.body.sort((a, b) => {
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    if (b.name.toLowerCase() > a.name.toLowerCase()) {
                        return -1;
                    }
                    return 0;
                });
            });
        }, 800);
    }

    public saveRelatations(input: Array<any>, fn?: () => void): any {
        this.rcSaveRelations(input, 0, () => {
            if (fn) {
                return fn();
            }
        });
    }

    private rcSaveRelations(input: Array<any>, index: number, fn: () => void) {
        if (index === input.length) {
            return fn();
        }
        const val = input[index];
        const path = val.id ? `reportsRelated/${val.id}` : 'reportsRelated';
        const method = val.id ? 'patch' : 'post';
        const data = val.id ? {
            pos: val.pos
        } : {
            pos: val.pos,
            reportId: val.reportId,
            relatedId: val.relatedId
        };

        this.http[method]({
            path,
            data
        }).subscribe((response: any) => {
            if (!val.id) {
                response.body.related = val.related;
                this.relatedReports.push(response.body);
            }
            index++;
            this.rcSaveRelations(input, index, fn);
        });
    }

    public relateReport(related: any): void {
        this.foundedReports = [];
        if (this.relatedReports.length >= 4) {
            this.ifilter = '';
            return;
        }
        this.saveRelatations([
            {
                reportId: this.reportId,
                relatedId: related.id,
                pos: this.relatedReports.length,
                related: {
                    id: related.id,
                    name: related.name
                }
            }
        ], () => {
            this.ifilter = '';
        });
    }

    public deleteReportRelationship(related: any): void {
        if (this.readOnly) {
            return;
        }

        this.http.delete({
            path: `reportsRelated/${related.id}`
        }).subscribe(() => {
            this.relatedReports = this.relatedReports.filter((a) => a.id !== related.id);
        });
    }
}

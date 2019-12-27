import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Grapes } from "./grapes/grape.config";
import { HttpService } from '../../../services/http.service';

import * as M from "materialize-css/dist/js/materialize";

declare var grapesjs: any;

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: [
        'board.component.scss'
    ]
})

export class BoardComponent implements OnInit, AfterViewInit {
    public editor: any = null;
    public grapes: any = null;
    public report: any = {
        "name": "",
        "slug": "",
        "trash": false,
        "content": "",
        "sectionTypeKey": "informe-nuevo",
        "templateId": "0",
        "userId": "5e024912b8287319151c688a",
        "stateId": "5e024bcab8287319151c6897",
        "sectionId": "5e024cc7b8287319151c6898",
        "folderId": "5e024997b8287319151c688c"
    };

    constructor(
        private http: HttpService,
    ) {
        this.grapes = new Grapes({
            selectorManager: '.styles-container',
            blockManager: '.blocks-container',
            styleManager: '.styles-container'
        });
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initGrapes();
        console.log(this.editor);
        console.log(this.editor.Canvas.getDocument());
        var toTab = document.querySelectorAll('.tabs');
        var toCollapse = document.querySelectorAll('.collapsible');
        var instance = M.Tabs.init(toTab);
        var instances = M.Collapsible.init(toCollapse);
    }

    private initGrapes(): void {
        this.grapes.activeBlocks([
            'Description', 'Image', 'Title'
        ]);
        this.grapes.activeSectors([
            'Dimensions'
            //, 'Extras'
        ]);

        this.editor = grapesjs.init(this.grapes.get('config'));
    }

    public onSave(): void {
        this.report.slug = `/${this.report.name.toLocaleLowerCase().replace(/(\s)/g, '-')}`;
        this.report.content = this.editor.getHtml();

        if (this.report.id) {
            this.http.put({
                'path': 'reports',
                'data': this.report
            }).subscribe((response) => {
                console.log(response);
            });
        } else {
            this.http.post({
                'path': 'reports',
                'data': this.report
            }).subscribe((response) => {
                console.log(response);
            });
        }
    }
}

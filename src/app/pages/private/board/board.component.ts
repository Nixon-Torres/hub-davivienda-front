import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Grapes } from "./grapes/grape.config";
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

    constructor() {
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
        var toTab = document.querySelectorAll('.tabs');
        var toCollapse = document.querySelectorAll('.collapsible');
        var instance = M.Tabs.init(toTab);
        var instances = M.Collapsible.init(toCollapse);
    }

    initGrapes() {
        this.grapes.activeBlocks([
            'Description', 'Image', 'Title'
        ]);
        this.grapes.activeSectors([
            'Dimensions', 'Extras'
        ]);
        grapesjs.init(this.grapes.get('config'));
    }
}

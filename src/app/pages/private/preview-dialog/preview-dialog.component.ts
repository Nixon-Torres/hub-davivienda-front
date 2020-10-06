import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../../services/http.service';
import {
    CustomClickEvent,
    TextSelectEvent,
} from 'src/app/directives/text-select.directive';
import { DomSanitizer } from '@angular/platform-browser';

const COMMENT_TAG_NAME = 'mark';
const COMMENT_ATTRIBUTE_NAME = 'comment-id';

interface SelectionRectangle {
    left: number;
    top: number;
    width: number;
    height: number;
}

@Component({
    selector: 'app-preview-dialog',
    templateUrl: './preview-dialog.component.html',
    styleUrls: ['./preview-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PreviewDialogComponent implements OnInit {
    public report: any = {
        id: null,
        styles: '',
        content: ''
    };

    public myhtml: any = '';
    public threadId: string|number = null;
    private templatePlaceHolders: Array<string> = [];

    public hostRectangle: SelectionRectangle | null = null;
    private selectedText: string = '';
    private selectionInfo:any = null;

    constructor(
        public dialogRef: MatDialogRef<PreviewDialogComponent>,
        private http: HttpService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sanitizer: DomSanitizer,
    ) {
        this.report.id = this.data.reportId;
    }

    ngOnInit() {
        if (!this.report.id) {
            alert('¡Oops!\nNo encontramos el reporte');
            return;
        }

        document.querySelector('.mat-dialog-container').classList.add('not-scrollable');
        this.loadReport();
    }

    public loadReport(): void {
        this.http.get({
            'path': `reports/view?id=${this.report.id}`
        }).subscribe((response: any) => {
            this.report.styles = response.body.view.styles ? response.body.view.styles : '';
            this.report.content = response.body.view.content ? response.body.view.content : '';
            this.myhtml = this.sanitizer.bypassSecurityTrustHtml(response.body.view.content);
        });

        this.http.get({
            'path': `reports/${this.report.id}`
        }).subscribe((response: any) => {
            this.report = response.body;
            this.loadTemplate(this.report.templateId);
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    public renderRectangles(event: TextSelectEvent): void {
        // There is a selection, validate it is part of any report placeholder
        let found = false;
        let key = null;
        let value = null;
        const eventSelection: Selection = event.selection;
        if (!!!eventSelection) {
            this.hostRectangle = null;
            this.selectedText = "";
            return;
        }

        let node:any = eventSelection.anchorNode;

        while (node !== null) {
            for (let i = 0; i < this.templatePlaceHolders.length; i++) {
                key = this.templatePlaceHolders[i];
                value = this.report[key];

                if (node.outerHTML && value === node.outerHTML) {
                    found = true;
                    break;
                }
            }
            if (found)
                break;
            node = node.parentNode;
        }

        // Display comment CTA
        if (found && event.hostRectangle) {
            /*let textNode = (eventSelection.anchorNode as Text);
            let parentNode = eventSelection.anchorNode.parentNode;
            const targetNode = textNode.splitText(eventSelection.anchorOffset);
            targetNode.splitText(Math.min(eventSelection['extentOffset'], targetNode.length));
            const mark:HTMLElement = document.createElement(COMMENT_TAG_NAME);
            mark.setAttribute(COMMENT_ATTRIBUTE_NAME, '1231313');
            parentNode.insertBefore(mark, targetNode);
            mark.appendChild(targetNode);*/

            console.log(node['outerHTML'], key, value);

            this.hostRectangle = event.hostRectangle;
            this.selectedText = event.text;
            const selectedNode = eventSelection.anchorNode;
            let idx;
            for (idx = 0; idx < selectedNode.parentNode.childNodes.length; idx++) {
                if (selectedNode.parentNode.childNodes[idx] === selectedNode)
                    break;
            }
            this.selectionInfo = {
                selectedNodeName: selectedNode.nodeName,
                parentNodeName: selectedNode.parentNode.nodeName,
                selectedNodeData: selectedNode['data'],
                parentIndex: idx,
                parentChildrenLen: selectedNode.parentNode.childNodes.length,
                offset: Math.min(eventSelection.anchorOffset, eventSelection['extentOffset']),
                len: Math.max(eventSelection.anchorOffset, eventSelection['extentOffset']),
                section: key,
            };
        }
    }

    public contentOnClick(event: CustomClickEvent): void {
        if (event.target.attributes[COMMENT_ATTRIBUTE_NAME] &&
            this.threadId !== event.target.attributes[COMMENT_ATTRIBUTE_NAME].value) {
            this.threadId = event.target.attributes[COMMENT_ATTRIBUTE_NAME].value;
        }
    }

    public onCommentAction(evt: any): void {
        this.selectionInfo = null;
        this.loadReport();
    }

    private loadTemplate(templateId: string | number): void {
        if (!!!templateId) return;
        this.http.get({
            'path': `templates/${templateId}`
        }).subscribe((response: any) => {
            const template = response.body;
            this.templatePlaceHolders =
                template.content.match(/{{[{]?(.*?)[}]?}}/g)
                    .map(e => {
                        const replacer1 = new RegExp('{', 'g');
                        const replacer2 = new RegExp('}', 'g');
                        return e.replace(replacer1, '').replace(replacer2, '');
                    })
                    .filter(e => {
                        return this.report.hasOwnProperty(e);
                    });
        });
    }

    public createCommentFromSelection() {
        this.threadId = 'CREATE_NEW';
    }
}

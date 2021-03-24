import {
    Component,
    OnInit,
    Inject,
    ViewEncapsulation,
    NgZone,
} from '@angular/core';
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
        private zone: NgZone,
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
            setTimeout(() => {
                const parent = document.getElementById('marketingCode') as HTMLElement;
                if (!parent) {
                    return;
                }
                const scripts = parent.getElementsByTagName('script') as unknown as HTMLScriptElement[];
                const scriptsInitialLength = scripts.length;
                for (let i = 0; i < scriptsInitialLength; i++) {
                    const script = scripts[i];
                    const scriptCopy = document.createElement('script') as HTMLScriptElement;
                    scriptCopy.type = script.type ? script.type : 'text/javascript';
                    if (script.innerHTML) {
                        scriptCopy.innerHTML = script.innerHTML;
                    } else if (script.src) {
                        scriptCopy.src = script.src;
                    }
                    scriptCopy.async = false;
                    script.parentNode.replaceChild(scriptCopy, script);
                }
            }, 1000);
        });

        let include:Array<any> = [
            {
                relation: 'blocks',
                scope: {
                    order: 'createdAt ASC',
                }
            }];

        const filter = {
            include
        };

        this.http.get({
            'path': `reports/${this.report.id}?filter=${JSON.stringify(filter)}`
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
        let value: string|null = null;
        let block = null;
        const eventSelection: Selection = event.selection;
        console.log(`Event Selection`, eventSelection);
        if (!!!eventSelection) {
            this.hostRectangle = null;
            this.selectedText = "";
            return;
        }

        let node:any = eventSelection.anchorNode;
        let parentNode:any = node.parentNode ? node.parentNode : node;
        while (parentNode !== null) {
            if (parentNode.getAttribute && !!parentNode.getAttribute('hub-section-id')) {
                key = parentNode.getAttribute('hub-section-id');
                found = true;
                block = parentNode.getAttribute('hub-block');
                break;
            }
            parentNode = parentNode.parentNode;
        }

        // Display comment CTA
        if (found && event.hostRectangle) {
            this.hostRectangle = event.viewportRectangle;
            this.selectedText = event.text;
            const selectedNode = eventSelection.anchorNode;
            let idx;
            for (idx = 0; idx < selectedNode.parentNode.childNodes.length; idx++) {
                if (selectedNode.parentNode.childNodes[idx] === selectedNode)
                    break;
            }

            // extentOffset is not available on macOS
            const extentOffset = eventSelection.hasOwnProperty('extentOffset') ?
                eventSelection['extentOffset'] : eventSelection.focusOffset;

            this.selectionInfo = {
                selectedNodeName: selectedNode.nodeName,
                parentNodeName: selectedNode.parentNode.nodeName,
                selectedNodeData: selectedNode['data'],
                parentIndex: idx,
                parentChildrenLen: selectedNode.parentNode.childNodes.length,
                offset: Math.min(eventSelection.anchorOffset, extentOffset),
                len: Math.max(eventSelection.anchorOffset, extentOffset),
                section: key,
                block,
            };
        }
    }

    public contentOnClick(event: CustomClickEvent): void {
        if (event.target.attributes[COMMENT_ATTRIBUTE_NAME] &&
            this.threadId !== event.target.attributes[COMMENT_ATTRIBUTE_NAME].value) {
            this.zone.run(() => {
                this.threadId = event.target.attributes[COMMENT_ATTRIBUTE_NAME].value;
            });
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
        this.zone.run(() => {
            this.threadId = 'CREATE_NEW';
        });
    }
}

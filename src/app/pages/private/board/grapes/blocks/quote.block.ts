import { Block } from './block.model';

export class Quote {
    private block: Block = {
        id: 'block-quote',
        label: 'Quote',
        attributes: {
            class: "fa fa-quote-right"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <blockquote class="quote-gjs">\n        Lorem ipsum dolor do eiusmod...</blockquote>
        <style type="text/css">
            .quote-gjs {
                color: #777;
                font-weight: 300;
                padding: 10px;
                box-shadow: -5px 0 5px 0 #ccc;
                font-style: italic;
                margin: 20px 30px;
            }
        </style>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

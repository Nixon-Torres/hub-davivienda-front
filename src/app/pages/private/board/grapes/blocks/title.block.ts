import { Block } from './block.model';

export class Title {
    private block: Block = {
        id: 'block-title',
        label: 'Title',
        attributes: {},
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <style type="text/css">
            .box {
                color: white;
                padding: 20px 40px;
                font-family: Helvetica;
                background-color: black;
                font-family: 'PT Serif', serif;
            }
        </style>
        <div class="box">Dark block title</div>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

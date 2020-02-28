import { Block } from './block.model';

export class Olist {
    private block: Block = {
        id: 'block-ol',
        label: 'Lista numerica',
        attributes: {
            class: "fa fa-list-ol"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <ol class="ul-gjs">
            <li>Lorem ipsum dolor sit ame</li>
            <li>Sed ut perspiciatis unde</li>
            <li>At vero eos et accusamus</li>
        </ol>
        <style type="text/css">
            .ul-gjs {
                list-style: revert;
            }
        </style>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

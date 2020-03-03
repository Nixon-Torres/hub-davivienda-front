import { Block } from './block.model';

export class Ulist {
    private block: Block = {
        id: 'block-ul',
        label: 'Lista',
        attributes: {
            class: "fa fa-list-ul"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <ul class="ul-gjs">
            <li>Lorem ipsum dolor sit ame</li>
            <li>Sed ut perspiciatis unde</li>
            <li>At vero eos et accusamus</li>
        </ul>
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

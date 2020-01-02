import { Block } from './block.model';

export class Description {
    private block: Block = {
        id: 'block-description',
        label: 'Description',
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
            section {
                margin: 10px 40px;
                font-family: Helvetica;
            }
        </style>
        <section>
            <h1>Header</h1>
            <div>Lorem ipsum dolor sit amet</div>
        </section>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

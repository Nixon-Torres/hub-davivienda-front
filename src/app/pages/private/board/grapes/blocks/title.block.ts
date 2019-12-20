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
            <div data-gjs-type="text">Insert your texst here</div>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

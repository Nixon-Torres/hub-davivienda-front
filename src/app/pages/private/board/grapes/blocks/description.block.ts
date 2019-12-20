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
            <section>
                <h1>This is a simple title</h1>
                <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
            </section>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

import { Block } from './block.model';

export class Text {
    private block: Block = {
        id: 'block-text',
        label: 'Texto',
        attributes: {
            class: "gjs-fonts gjs-f-text"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): any {
        return {
            activeOnRender: 1,
            ​content: "Escriba su texto aqui"​,
            style: {
                padding: "10px",
                'font-family': "PT Serif"
            },
            type: 'text'
        };
    }

    public get(attr: string): any {
        return this[attr];
    }
}

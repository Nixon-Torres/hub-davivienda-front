import { Block } from './block.model';

export class Image {
    private block: Block = {
        id: 'block-image',
        label: 'Image',
        attributes: {
            class: "gjs-fonts gjs-f-image"
        },
        content: null,
        category: null,
        select: true,
        activate: true
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): any {
        return {
            type: 'image'
        };
    }

    public get(attr: string): any {
        return this[attr];
    }
}

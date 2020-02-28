import { Block } from './block.model';

export class Link {
    private block: Block = {
        id: 'block-link',
        label: 'Link',
        attributes: {
            class: "fa fa-link"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = {
            "​content": "Link"​,
            "style": { color: "#d983a6" },
            "type": "link"
        }
    }

    public get(attr: string): any {
        return this[attr];
    }
}

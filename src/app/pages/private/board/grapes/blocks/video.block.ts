import { Block } from './block.model';

export class Video {
    private block: Block = {
        id: 'block-video',
        label: 'Video',
        attributes: {
            class: "fa fa-youtube-play",
        },
        content: null,
        category: { id: "Media", label: "Media", open: false },
        select: true,
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): any {
        return {
            type: 'video',
            provider: 'so' //TODO put Youtube by default
        };
    }

    public get(attr: string): any {
        return this[attr];
    }
}

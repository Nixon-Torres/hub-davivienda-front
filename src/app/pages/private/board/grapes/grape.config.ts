import { Config, Managers } from './grape.model';
import { Description, Image, Title } from './blocks/block.main';
import { Typography } from './sectors/sector.main';

class Grapes {
    public config: Config = {
        width: '100%',
        height: '100%',
        container: '#gjs',
        fromElement: true,
        storageManager: false,
        panels: {
            defaults: [{}]
        },
        blockManager: {},
        traitManager: {},
        styleManager: {}
    };

    private blocks: any = {};
    private sectors: any = {};

    constructor(selectors: Managers) {
        this.loadBlocks(selectors.blockManager);
        this.loadTraits(selectors.traitManager);
        this.loadStyles(selectors.styleManager);

        this.blocks = {
            Description: new Description,
            Image: new Image,
            Title: new Title
        };
        this.sectors = {
            Typography: new Typography
        };
    }

    private loadBlocks(selector: string) {
        this.config.blockManager = {
            appendTo: selector,
            blocks: []
        };
    }

    private loadTraits(selector: string) {
        this.config.traitManager = {
            appendTo: selector
        };
    }

    private loadStyles(selector: string) {
        this.config.styleManager = {
            appendTo: selector,
            sectors: []
        };
    }

    public activeBlocks(blocks: Array<string>) {
        for (let block of blocks) {
            this.config.blockManager.blocks.push(this.blocks[block].get('block'));
        }
    }

    public activeSectors(sectors: Array<string>) {
        for (let sector of sectors) {
            this.config.styleManager.sectors.push(this.sectors[sector].get('sector'));
        }
    }

    public get(attr: string): any {
        return this[attr];
    }
}

export { Grapes }

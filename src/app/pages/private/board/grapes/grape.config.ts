import { Config, Managers } from './grape.model';
import { Description, Image, Title } from './blocks/block.main';
import { Dimensions, Extras } from './sectors/sector.main';

class Grapes {
    public config: Config = {
        width: '90%',
        height: '90%',
        container: '#gjs',
        fromElement: true,
        storageManager: false,
        panels: {
            defaults: [{}]
        },
        blockManager: {},
        selectorManager: {},
        styleManager: {}
    };

    private blocks: any = {};
    private sectors: any = {};

    constructor(selectors: Managers) {
        this.loadSelector(selectors.selectorManager);
        this.loadBlocks(selectors.blockManager);
        this.loadStyles(selectors.styleManager);

        this.blocks = {
            Description: new Description,
            Image: new Image,
            Title: new Title
        };
        this.sectors = {
            Dimensions: new Dimensions,
            Extras: new Extras
        };
    }

    private loadSelector(selector: string) {
        this.config.selectorManager = {
            appendTo: selector
        };
    }

    private loadBlocks(selector: string) {
        this.config.blockManager = {
            appendTo: selector,
            blocks: []
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

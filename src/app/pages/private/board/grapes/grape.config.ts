import { Config, Managers } from './grape.model';
import { Typography } from './sectors/sector.main';
import { 
    Text, 
    Link, 
    Image, 
    Video, 
    Quote, 
    Ulist,
    Olist,
    OneColumn, 
    TwoColumns, 
    ThreeColumns,
} from './blocks/block.main';

class Grapes {
    public config: Config = {
        width: '100%',
        height: '100%',
        allowScripts: 1,
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
    public countdownConfig = {
        endText: 'Finalizado',
        labelDays: 'Días',
        labelHours: 'Horas',
        labelMinutes: 'Minutos',
        labelSeconds: 'Segundos',
        dateInputType: 'datetime-local',
        labelCountdownCategory: { id: "Extra", label: "Extra", open: false },
    };
    public customCodeConfig = {
        modalTitle: 'Editor HTML y CSS',
        buttonLabel: 'Guardar'
    }

    private blocks: any = {};
    private sectors: any = {};

    constructor(selectors: Managers) {
        this.loadBlocks(selectors.blockManager);
        this.loadTraits(selectors.traitManager);
        this.loadStyles(selectors.styleManager);

        this.blocks = {
            OneColumn: new OneColumn,
            TwoColumns: new TwoColumns,
            ThreeColumns: new ThreeColumns,
            Text: new Text,
            Link:new Link,
            Image:new Image,
            Video:new Video,
            Quote:new Quote,
            Ulist:new Ulist,
            Olist:new Olist
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

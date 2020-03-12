import { Block } from './block.model';

export class ThreeColumns {
    private block: Block = {
        id: 'block-three-columns',
        label: '3 Columnas',
        attributes: {
            class: "gjs-fonts gjs-f-b3"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <div  class="row-gjs"data-gjs-droppable=".cell"data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}'data-gjs-name="Row">
            <div  class="cell"data-gjs-draggable=".row-gjs"data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":0.2,"keyWidth":"flex-basis"}'data-gjs-name="Cell"data-gjs-unstylable='["width"]'data-gjs-stylable-require='["flex-basis"]'></div>
            <div  class="cell"data-gjs-draggable=".row-gjs"data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":0.2,"keyWidth":"flex-basis"}'data-gjs-name="Cell"data-gjs-unstylable='["width"]'data-gjs-stylable-require='["flex-basis"]'></div>
            <div  class="cell"data-gjs-draggable=".row-gjs"data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":1,"bl":0,"br":0,"minDim":1,"bc":0,"currentUnit":1,"step":0.2,"keyWidth":"flex-basis"}'data-gjs-name="Cell"data-gjs-unstylable='["width"]'data-gjs-stylable-require='["flex-basis"]'></div>
        </div>
        <style>
        .row-gjs {
            display: flex;
            justify-content: flex-start;
            align-items: stretch;
            flex-wrap: nowrap !important;
            padding: 10px;
            font-family: 'PT Serif', serif;
        }

        @media (max-width:768px) {
            .row-gjs {
                flex-wrap: wrap !important;
            }

        }

        .cell {
            min-height: 75px;
            flex-grow: 1;
            flex-basis: 100%;
        }
        </style>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

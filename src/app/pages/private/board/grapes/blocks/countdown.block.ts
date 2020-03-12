import { Block } from './block.model';

export class Countdown {
    private block: Block = {
        id: 'block-countdown',
        label: 'Countdown',
        attributes: {
            class: "fa fa-clock-o"
        },
        content: null,
        category: null
    }

    constructor() {
        this.block.content = this.buildContent();
    }

    private buildContent(): string {
        return `
        <div class="countdown" data-gjs-type="countdown"></div>
        <style>
            .countdown {
              text-align: center;
              font-family: Helvetica, serif;
            }

            .countdown-block {
              display: inline-block;
              margin: 0 10px;
              padding: 10px;
            }

            .countdown-digit {
              font-size: 5rem;
            }

            .countdown-endtext {
              font-size: 5rem;
            }

            .countdown-cont,
            .countdown-block {
              display: inline-block;
            }
        </style>
        `;
    }

    public get(attr: string): any {
        return this[attr];
    }
}

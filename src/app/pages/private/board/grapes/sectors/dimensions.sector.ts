import { Sector } from './sector.model';

export class Dimensions {
    private sector: Sector = {
        name: 'Dimensiones',
        open: true,
        buildProps: ['width', 'min-height', 'padding'],
        properties: [
            {
                type: 'integer',
                name: 'The width',
                property: 'width',
                units: ['px', '%'],
                defaults: 'auto',
                min: 0
            }
        ]
    }

    public get(attr: string): any {
        return this[attr];
    }
}

import { Sector } from './sector.model';

export class Extras {
    private sector: Sector = {
        name: 'Extras',
        open: false,
        buildProps: ['background-color', 'box-shadow', 'custom-prop'],
        properties: [
            {
                id: 'custom-prop',
                name: 'Custom Label',
                property: 'font-size',
                type: 'select',
                defaults: '32px',
                options: [
                    { value: '12px', name: 'Tiny' },
                    { value: '18px', name: 'Medium' },
                    { value: '32px', name: 'Big' },
                ],
            }
        ]
    }

    public get(attr: string): any {
        return this[attr];
    }
}

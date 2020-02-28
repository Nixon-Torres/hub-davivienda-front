import { Sector } from './sector.model';

export class Typography {
    private sector: Sector = {
        name: 'Tipografía',
        open: true,
        buildProps: ['text-align', 'text-decoration', 'font-weight', 'font-style'],
        properties: [{
			property: 'text-align',
			type: 'radio',
			defaults: 'left',
			list: [
				{ value : 'left',  name : 'Izq',    className: 'fa fa-align-left'},
				{ value : 'center',  name : 'Centro',  className: 'fa fa-align-center' },
				{ value : 'right',   name : 'Der',   className: 'fa fa-align-right'},
				{ value : 'justify', name : 'Justf',   className: 'fa fa-align-justify'}
			],
		},{
			property: 'text-decoration',
			type: 'radio',
			defaults: 'none',
			list: [
				{ value: 'none', name: 'None', className: 'fa fa-times'},
				{ value: 'underline', name: 'underline', className: 'fa fa-underline' },
				{ value: 'line-through', name: 'Line-through', className: 'fa fa-strikethrough'}
			],
		},{
			property: 'font-style',
			type: 'select',
			defaults: 'normal',
			list: [
				{ value: 'normal', name: 'Normal'},
				{ value: 'italic', name: 'Cursiva'}
			],
		}]
    }

    public get(attr: string): any {
        return this[attr];
    }
}

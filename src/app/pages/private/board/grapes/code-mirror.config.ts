import { Config } from './code-mirror.model';

class CodeMirror {

	public config: Config = {
		codeName: 'htmlmixed',
        readOnly: false,
        theme: 'hopscotch',
        autoBeautify: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        styleActiveLine: true,
        smartIndent: true,
        indentWithTabs: true
	};
	
	constructor() {	}

	public getConfig(): any {
        return this.config;
    }
}

export { CodeMirror }
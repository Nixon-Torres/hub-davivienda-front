/** CodeMirror Config
*
* Get more configurations on https://codemirror.net/doc/manual.html#config
*/
export interface Config {
    theme: string,
	codeName: string,
    readOnly: boolean,
    smartIndent: boolean,
    lineWrapping: boolean,
    autoBeautify: boolean,
    autoCloseTags: boolean,
    indentWithTabs: boolean
    styleActiveLine: boolean,
    autoCloseBrackets: boolean,
}
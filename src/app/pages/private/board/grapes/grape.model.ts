export interface Config {
    width: string,
    height: string,
    container: string,
    fromElement: boolean,
    storageManager: any,
    panels: any,
    blockManager: any,
    traitManager: any,
    styleManager: any,
    plugins?: any,
    pluginsOpts?: any
    allowScripts?: number,
}

export interface Managers {
    blockManager: string,
    traitManager: string,
    styleManager: string
}

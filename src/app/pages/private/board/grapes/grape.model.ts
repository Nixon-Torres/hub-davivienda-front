export interface Config {
    width: string,
    height: string,
    container: string,
    fromElement: boolean,
    storageManager: any,
    panels: any,
    blockManager: any,
    styleManager: any,
    selectorManager: any
}

export interface Managers {
    selectorManager: string,
    blockManager: string,
    styleManager: string
}

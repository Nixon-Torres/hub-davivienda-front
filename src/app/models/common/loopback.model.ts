export class loopback {
    filter: lbfilter = new lbfilter();
}

export class lbfilter{
    skip: number = null;
    limit: number = null;
    order: string = null;
    fields: {} = new Object();
    include: any [] = new Array();
    where: {} = new Object();
}

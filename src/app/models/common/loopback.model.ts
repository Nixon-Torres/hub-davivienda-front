export class loopback {
    filter: lbfilter = new lbfilter();
}

export class lbfilter{
    skip: number = null;
    limit: number = null;
    include: any [] = new Array();
    where: {} = new Object();
}

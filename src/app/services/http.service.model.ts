export class Request {
    path: string;
    data?: any;
    headers?: Array<any> = [];
}

export interface Response {
    headers: any;
    status: number;
    statusText: string;
    url: string;
    ok: boolean;
    type: number;
    body: any;
}

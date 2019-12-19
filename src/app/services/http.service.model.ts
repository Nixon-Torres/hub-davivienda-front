export class Request {
  path: string;
  data: any;
  headers: Array<any> = [];
}

export interface Response {
  success: string;
  data: any;
  message: string;
}

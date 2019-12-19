import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Request, Response } from "./http.service.model";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  public get(input: Request) {
    let params = new URLSearchParams();
    for (let key in input.data) {
      if (input.data.hasOwnProperty(key)) {
        params.set(key, input.data[key])
      }
    }
    console.log(params);
    return this.http.get<Response>(input.path);
  }

  public preload(flag: boolean) {
    console.log('preload', flag);
  }
}

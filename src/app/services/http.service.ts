import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  public post(input: Request) {
    this.http.post<Response>(input.path, input.data).pipe(
      // catchError(this.handleError(''))
    );
  }

  public put(input: Request) {
    this.http.put<Response>(input.path, input.data).pipe(
      // catchError(this.handleError(''))
    );
  }

  public preload(flag: boolean) {
    console.log('preload', flag);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}

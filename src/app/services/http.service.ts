import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Request, Response } from './http.service.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    public authorization: string = null;
    private _URL_API: string = environment.URL_API;

    constructor(
        private http: HttpClient
    ) {
    }

    public get(input: Request): Observable<HttpResponse<Response>> {
        let params = new URLSearchParams();
        for (let key in input.data) {
            if (input.data.hasOwnProperty(key)) {
                params.set(key, input.data[key]);
            }
        }
        let headers = this.headers();
        return this.http.get<Response>(this._URL_API + input.path, {
            observe: 'response',
            headers: headers
        }).pipe(catchError(this.handleError));
    }

    public post(input: Request): Observable<HttpResponse<Response>> {
        let headers = this.headers();
        return this.http.post<Response>(this._URL_API + input.path, input.data, {
            observe: 'response',
            headers: headers
        }).pipe(catchError(this.handleError));
    }

    public put(input: Request): Observable<HttpResponse<Response>> {
        let headers = this.headers();
        return this.http.put<Response>(this._URL_API + input.path, input.data, {
            observe: 'response',
            headers: headers
        }).pipe(catchError(this.handleError));
    }

    public delete(input: Request): Observable<HttpResponse<Response>> {
        let params = new URLSearchParams();
        for (let key in input.data) {
            if (input.data.hasOwnProperty(key)) {
                params.set(key, input.data[key]);
            }
        }
        let headers = this.headers();
        return this.http.delete<Response>(this._URL_API + input.path, {
            observe: 'response',
            headers: headers
        }).pipe(catchError(this.handleError));
    }

    public headers() {
        let headers: any = {};
        if(this.authorization) {
            headers.Authorization = this.authorization;
        }
        return headers;
    }

    public preload(flag: boolean) {
        console.log('preload', flag);
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            console.error(
                `Backend returned code ${error.status}, body was: `,
                error.error
            );
        }
        return throwError('Something bad happened; please try again later.');
    };
}

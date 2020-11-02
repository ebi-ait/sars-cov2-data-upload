import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable} from 'rxjs';
import { WebinUser } from '../model/WebinUser';
import {environment as env} from '../../../environments/environment';

@Injectable()
export class WebinAuthService {
    webinUser: WebinUser;

    constructor(private http: HttpClient) {
        this.webinUser = new WebinUser();
    }

    getWebinUser(email: string): Observable<WebinUser> {
        const body = { authRealms: [ 'SRA', 'EGA' ], password: env.WEBINSUPERUSERPASS, username: email };

        const headers: HttpHeaders = new HttpHeaders()
            .append('Content-Type', 'application/json')
            .append('Accept', '*/*');

        return this.http.post<WebinUser>('https://www.ebi.ac.uk/ena/auth/' + 'login/', body, {headers});
    }
}

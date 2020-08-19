import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from './interfaces/user';
import {Observable} from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) { }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.APIURL}/register`, user);
  }

  getUserData(email: string): Observable<User> {
    return this.http.get<User>(`${environment.APIURL}/user/${email}`);
  }
}

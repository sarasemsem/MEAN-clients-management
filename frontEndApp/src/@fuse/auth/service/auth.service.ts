import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment, rest } from '@fuse/environments/environment';
import { UserDTO } from '@fuse/shared/context/DTO';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http: HttpClient) {
    axios.defaults.baseURL = environment.baseApi;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  }
  clear() {
    localStorage.clear();
  }

  clearCache(): Observable<any> {
    const url = `${environment.baseApi}/clear_cache`;
    const headers = this.getHeaders();  
    return this._http.get(url, { headers }).pipe(
      tap(() => console.log('Cache cleared successfully')), // Log success
      catchError((error: HttpErrorResponse) => {
        console.error('Error clearing cache:', error);
        return throwError('Failed to clear cache. Please try again later.'); // Throw error
      })
    );
  }
  

  getHeaders(): HttpHeaders {
    // Get the authentication token from your authService
    const authToken = this.getAuthToken();

    // Create headers with the token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
    });

    return headers;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setAuthToken(token: string | null): void {
    if (token !== null) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  setUser(id: string, name: string, email: string) {
    sessionStorage.setItem(
      'user',
      JSON.stringify({ userId: id, firstName: name, email: email })
    );
  }
  getUser(): any {
    let user = <UserDTO>JSON.parse(sessionStorage.getItem('user')!) || {};
    return user;
  }

  setRoles(roles: Array<string>) {
    localStorage.setItem('user_role', JSON.stringify(roles));
  }
  getRoles(key?: String): Array<String> {
    let roles = localStorage.getItem('user_role');
    if (!roles && key) {
      roles = localStorage.getItem(`${key}_role`);
    }
    try {
      return JSON.parse(roles!) as Array<String>;
    } catch {}
    return [];
  }
  
  isLoggedIn() {
    return this.getRoles() && this.getAuthToken();
  }

  async request(method: string, url: string, data: any): Promise<any> {
    let headers = {};
    if (this.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer' + this.getAuthToken() };
    }
    try {
      return await axios({
        method: method,
        url: url,
        data: data,
        headers: headers,
      });
    } catch (error) {
      console.error('Axios request error:', error);
      throw new Error('Something bad happened; please try again later.');
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('An error occurred:', error.error.message);
      return throwError(`Client-side error: ${error.error.message}`);
    } else if (error.status) {
      // Server-side error with HTTP status
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
      return throwError(`Server-side error: ${error.status}, ${error.error}`);
    } else {
      // Other types of errors
      console.error('An unknown error occurred:', error);
      return throwError('Something bad happened; please try again later.');
    }
  }
}

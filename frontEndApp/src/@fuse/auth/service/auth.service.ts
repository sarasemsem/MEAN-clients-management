import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, scheduled, switchMap, tap, throwError } from 'rxjs';
import { environment, rest } from '@fuse/environments/environment';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  private _authenticated: boolean = false;
  clear() {
    localStorage.clear();
  }
  

  getHeaders(): HttpHeaders {
    // Get the authentication token from your authService
    const authToken = this.authToken;

    // Create headers with the token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
    });

    return headers;
  }

  get authToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  set authToken(token: string | null) {
    if (token !== null) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  setUser(id: string, name: string, email: string) {
    console.log(id, name, email);
    sessionStorage.setItem(
      'user',
      JSON.stringify({ userId: id, firstName: name, email: email })
    );
  }
  getUser(): any {
    let user = <any>JSON.parse(sessionStorage.getItem('user')!) || {};
    return user;
  }
  
  isLoggedIn() {
    return this.authToken;
  }
  signIn(credentials: { email: string; password: string }): Observable<any> {
    this.signOut();

    // Throw error if the user is already logged in
    if (this._authenticated) {
        return throwError('User is already logged in.');
    }

    return this._httpClient.post(environment.baseApi+ rest.login, { credentials }).pipe(
        switchMap((response: any) => {
            // Ensure response structure matches
            if (response.success && response.data.user.token) {
                // Store the access token in the local storage
                this.authToken = response.data.user.token;
                console.log(response.data);
                
                this.setUser(response.data.user._id, response.data.user.firstName, response.data.user.email);

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.data.user;

                // Return a new observable with the response
                return of(response);
            } else {
                // Handle error cases
                return throwError('Login failed');
            }
        }),
    );
}

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }
     /**
     * Forgot password
     *
     * @param email
     */
     forgotPassword(email: string): Observable<any>
     {
         return this._httpClient.post('api/auth/forgot-password', email);
     }
 
     /**
      * Reset password
      *
      * @param password
      */
     resetPassword(password: string): Observable<any>
     {
         return this._httpClient.post('api/auth/reset-password', password);
     }
 
/**
     * Check the authentication status
     */
check(): Observable<boolean>
{
    // Check if the user is logged in
    if ( this._authenticated )
    {
        return of(true);
    }

    // Check the access token availability
    if ( !this.authToken )
    {
        return  of(false);
    }

    // Check the access token expire date
    if ( AuthUtils.isTokenExpired(this.authToken) )
    {
        return of(false);
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

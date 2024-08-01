import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, of, throwError } from 'rxjs';
import { AuthService } from '@fuse/auth/service/auth.service';
import { environment, rest } from '@fuse/environments/environment';
import { UserDTO } from '@fuse/shared/context/DTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private subject = new BehaviorSubject<void>(undefined);

  constructor(private _http: HttpClient, private authService:AuthService, private router:Router) {  
  }
  
     // Add this method to notify subscribers when changes occur
     notifyChanges(): void {
      this.subject.next();
    }
  
    getChangesObservable(): Observable<void> {
      return this.subject.asObservable();
    }

  roleMatch(allawedRoles : any): boolean{
   let isMatch = false;
   const userRoles:any = this.authService.getRoles();
   if (userRoles !=null && userRoles) {
    for (let i = 0; i < userRoles.length; i++) {
      for (let j = 0; j < allawedRoles.length; j++) {
         if (userRoles[i].roleName ===allawedRoles[j]) {
          isMatch= true;
          return isMatch
         }
      }
    }
   }
   return isMatch;
  }

  addUser(data: UserDTO): Observable<UserDTO> {
    const headers = this.authService.getHeaders();
    return this._http.post<UserDTO>(environment.baseApi + rest.users, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  getUserDetails(userId: string): Observable<UserDTO> { 
    const url = `${environment.baseApi}${rest.users}/${userId}`;
    const headers = this.authService.getHeaders();
    console.log('Request URL:', url); // Add this line to log the URL
    console.log('Request Headers:', headers); // Add this line to log the headers
    return this._http.get<UserDTO>(url, { headers }).pipe(
      catchError(this.handleError)
    );
}


  getAllUsers(): Observable<any> {
    const headers = this.authService.getHeaders();
    return this._http.get(environment.baseApi + rest.users, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, users: UserDTO): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Request Payload:', users);
    return this._http.patch(environment.baseApi + rest.users + `/${userId}`, users, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  deleteUser(id: string): Observable<any> {
    const url = `${environment.baseApi}${rest.users}/${id}`;
    const headers = this.authService.getHeaders();
    return this._http.delete(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('An error occurred:', error.error.message);
      return throwError(`Client-side error: ${error.error.message}`);
    } else 
    if (error.status === 403) {
      // Handle 403 Forbidden error here
      console.error('403 Forbidden Error:', error);
      // Redirect to login page
      this.router.navigate(['/login']);
      return throwError(error);
    }
    else if (error.status) {
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

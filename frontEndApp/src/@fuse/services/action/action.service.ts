import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '@fuse/auth/service/auth.service';
import { environment, rest } from '@fuse/environments/environment';
import { ActionDto } from '@fuse/shared/context/DTO';

@Injectable({
  providedIn: 'root'
})
export class ActionService {


  constructor(private _http: HttpClient, private authService: AuthService, private router:Router) {}

  private RoleSubject = new BehaviorSubject<void>(undefined);

    // Add this method to notify subscribers when changes occur
    notifyChanges(): void {
      this.RoleSubject.next();
    }
  
    getChangesObservable(): Observable<void> {
      return this.RoleSubject.asObservable();
    }

  addAction(actionData: any): Observable<ActionDto> {
    const headers = this.authService.getHeaders();
    return this._http.post<ActionDto>(environment.baseApi + rest.action, actionData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getActionDetails(id: string): Observable<ActionDto> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.action}/${id}`;
    return this._http.get<ActionDto>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllActions(): Observable<any> {
    const headers = this.authService.getHeaders();
    return this._http.get(environment.baseApi + rest.action, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateAction(id: string, action: ActionDto): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Request Payload:', action);
    return this._http.patch(environment.baseApi + rest.action + `/${id}`, action, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAction(id: string) {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.action}/${id}`;
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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment, rest } from '@fuse/environments/environment';
import { EmailDTO } from '@fuse/shared/context/DTO';
import { AuthService } from '@fuse/auth/service/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EmailsService {
  private subject = new BehaviorSubject<void>(undefined);

  constructor(private _http: HttpClient, private authService: AuthService, private router:Router) {}

  // Add this method to notify subscribers when changes occur
  notifyChanges(): void {
    this.subject.next();
  }

  getChangesObservable(): Observable<void> {
    return this.subject.asObservable();
  }

  getEmailDetail(emailId: any): Observable<any> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.email}/${emailId}`;
    return this._http.get(url, {
      headers,
    }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  getEmails(): Observable<EmailDTO[]> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.email}/retrievedEmails`;
    return this._http
      .get<EmailDTO[]>(url, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllUntreatedEmails(): Observable<EmailDTO[]> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.email}/untreatedEmails`;
    return this._http
      .get<EmailDTO[]>(url, { headers })
      .pipe(
        catchError(this.handleError) // Handle errors
      );
  }

  getTreatedEmails(): Observable<EmailDTO[]> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.email}/treatedEmails`;
    return this._http
      .get<EmailDTO[]>(url, { headers })
      .pipe(
        catchError(this.handleError) // Handle errors
      );
  }

  getUrgentEmails(): Observable<EmailDTO[]> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.email}/urgentEmails`;
    return this._http
      .get<EmailDTO[]>(url, { headers })
      .pipe(
        catchError(this.handleError) // Handle errors
      );
  }

  updateEmail(id: string, model: any): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log(model);
    return this._http.put(environment.baseApi+rest.email+`/${id}`, model, {
      headers,
    }).pipe(
      catchError(this.handleError) // Handle errors
    );;
  }
  
  deleteEmail(id: string): Observable<any> {
    const url = `${environment.baseApi}${rest.email}/${id}`; 
    const headers = this.authService.getHeaders();
    return this._http.delete(url, { headers }).pipe(
      catchError(this.handleError) // Handle errors
    );
  }
  
    deleteEmails(ids: string[]): Observable<any> {
      const url = `${environment.baseApi}${rest.email}/delete/${ids}`;
      console.log(url+ids)
      const headers = this.authService.getHeaders();  
      return this._http.delete(url, { headers }).pipe(
        catchError(this.handleError)
      );
    }

    clearCacheEmails(): Observable<any> {
      const url = `${environment.baseApi}${rest.email}/clear_cache`;
      const headers = this.authService.getHeaders();  
      return this._http.get(url, { headers }).pipe(
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

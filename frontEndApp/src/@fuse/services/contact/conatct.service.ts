import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment, rest } from '@fuse/environments/environment';
import { AuthService } from '@fuse/auth/service/auth.service';
import { SenderDTO } from '@fuse/shared/context/DTO';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ConatctService {

  constructor(private _http: HttpClient, private authService: AuthService, private router:Router) {}

  private RoleSubject = new BehaviorSubject<void>(undefined);

    // Add this method to notify subscribers when changes occur
    notifyChanges(): void {
      this.RoleSubject.next();
    }
  
    getChangesObservable(): Observable<void> {
      return this.RoleSubject.asObservable();
    }

  addContact(contactData: SenderDTO): Observable<SenderDTO> {
    const headers = this.authService.getHeaders();
    headers.append('Content-Type', 'application/json'); 
    console.log("add contact", headers);
    return this._http.post<SenderDTO>(environment.baseApi + rest.contact, contactData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getSenderDetails(senderId: string): Observable<SenderDTO> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.contact}/${senderId}`;
    return this._http.get<SenderDTO>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllContacts(): Observable<any> {
    const headers = this.authService.getHeaders();
    return this._http.get(environment.baseApi + rest.contact, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateContact(senderId: string, contact: SenderDTO): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Request Payload:', contact);
    return this._http.patch(environment.baseApi + rest.contact + `/${senderId}`, contact, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteContact(id: string) {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.contact}/${id}`;
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

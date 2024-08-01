import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment, rest } from '@fuse/environments/environment';
import { AuthService } from '@fuse/auth/service/auth.service';
import { CategoryDTO } from '@fuse/shared/context/DTO';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CategoryService { 

  private subject = new BehaviorSubject<void>(undefined);
  private dataSubject = new BehaviorSubject<CategoryDTO | null>(null);
  data$ = this.dataSubject.asObservable();


  constructor(private _http: HttpClient, private authService: AuthService, private router:Router) {}

     // Add this method to notify subscribers (e.g., KeywordsListComponent) when changes occur
    notifyChanges(): void {
      this.subject.next();
    }
    
    getChangeObservable(): Observable<void> {
      return this.subject.asObservable();
    }

  getAllCategories(): Observable<any> {
    const headers = this.authService.getHeaders();
    return this._http.get(environment.baseApi + rest.categories, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addCategory(category: CategoryDTO): Observable<any> {
    const headers = this.authService.getHeaders();
    headers.append('Content-Type', 'application/json'); 
    return this._http.post<any>(environment.baseApi + rest.categories, category, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getCategoryById(id: string): Observable<CategoryDTO> {
    const headers = this.authService.getHeaders();
    const url = `${environment.baseApi}${rest.categories}/${id}`;
    return this._http.get<CategoryDTO>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateCategory(id: string, category: CategoryDTO): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Request Payload:', category);
    return this._http.patch(environment.baseApi + rest.categories + `/${id}`, category, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteCategory(id: string): Observable<any> {
    const url = `${environment.baseApi}${rest.categories}/${id}`;
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

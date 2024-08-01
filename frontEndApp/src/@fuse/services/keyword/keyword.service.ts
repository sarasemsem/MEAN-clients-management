import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '@fuse/auth/service/auth.service';
import { environment, rest } from '@fuse/environments/environment';
import { keywordDto } from '@fuse/shared/context/DTO';

@Injectable({
  providedIn: 'root'
})
export class KeywordService {

  private keywordSubject = new BehaviorSubject<void>(undefined);
  private keywordDataSubject = new BehaviorSubject<keywordDto | null>(null);
  keywordData$ = this.keywordDataSubject.asObservable();

  constructor(private _http: HttpClient, private authService: AuthService, private router : Router) {}

    // Add this method to notify subscribers (e.g., KeywordsListComponent) when changes occur
    notifyKeywordChange(): void {
      this.keywordSubject.next();
    }
    
    getKeywordChangeObservable(): Observable<void> {
      return this.keywordSubject.asObservable();
    }

  addKeyWord(data: keywordDto): Observable<any> {
    console.log('Request Payload:', data);
    const headers = this.authService.getHeaders();
    headers.append('Content-Type', 'application/json'); 
    return this._http.post<any>(environment.baseApi + rest.keyword, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  getKeyWordDetails(keywordId: string): Observable<keywordDto> { 
    const url = `${environment.baseApi}${rest.keyword}/${keywordId}`;
    const headers = this.authService.getHeaders();
    return this._http.get<keywordDto>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAllKeyWord(): Observable<keywordDto[]> {
    const url = `${environment.baseApi}${rest.keyword}`;
    const headers = this.authService.getHeaders();
    return this._http.get<keywordDto[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  getKeyWordByCategory(keyWordId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    return this._http.get(environment.baseApi + rest.keyword + `/keywordsByCategory/${keyWordId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateKeyWord(keyWordId: string, keyWords: keywordDto): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Request Payload:', keyWords);
    return this._http.patch(environment.baseApi + rest.keyword + `/${keyWordId}`, keyWords, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  deleteKeyWord(id: string): Observable<any> {
    const url = `${environment.baseApi}${rest.keyword}/${id}`;
    const headers = this.authService.getHeaders();
    return this._http.delete(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  clearCacheKeyWord(): Observable<any> {
    const url = `${environment.baseApi}${rest.keyword}/clear_cache`;
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

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { AuthService } from "./service/auth.service";
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available.
    if (request.headers.get('No-Auth') === 'True') {
      return next.handle(request.clone());
    }
    
    const token: string = this.authService.getAuthToken() || '';
    request = this.addToken(request, token);

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        // If we have an unauthorized error, logout the user and redirect to the login page.
        if (err.status === 401) {
          this.router.navigate([`/forbidden`]);
        } else if (err.status === 403) {
          this.router.navigate([`/login`]);
        } else if (err.status === 0) {
          // Handle network errors, e.g., server unreachable
          this.router.navigate(['/login']);
        }else if (err.error && err.error.message === 'Token expired') {
          // Token expired - navigate to login page
          this.router.navigate([`/login`]);
        }  
        return throwError("Something is wrong");
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

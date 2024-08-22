import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@fuse/auth/service/auth.service';
import { environment, rest } from '@fuse/environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _authService: AuthService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        console.log("getting data");
        return this._httpClient.get(environment.baseApi + rest.users).pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    addUser(user: any): Observable<any> {
        return this._httpClient.post<any>(environment.baseApi + rest.users, user, { withCredentials: true });
    }

    updateUser(user: any): Observable<any> {
        return this._httpClient.put<any>(`${environment.baseApi + rest.users}/${user.id}`, user, { withCredentials: true });
    }

    getUserById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.baseApi + rest.users}/${id}`, { withCredentials: true});
    }

    deleteUser(id: string): Observable<any> {
        console.log('Deleting user with ID:', id);
        return this._httpClient.delete<any>(`${environment.baseApi + rest.users}/${id}`, { withCredentials: true });
    }
}

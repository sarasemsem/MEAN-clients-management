import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment, rest } from '@fuse/environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _selectedClient = new BehaviorSubject<any>(null);

    // Observable for client data
    data$ = this._data.asObservable();
    
    // Observable for selected client
    selectedClient$ = this._selectedClient.asObservable();

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // Method to set the selected client
    setSelectedClient(client: any) {
        this._selectedClient.next(client);
    }

    /**
     * Get data
     */
    getData(): Observable<any> {
        console.log("getting data");
        return this._httpClient.get(environment.baseApi + rest.clients).pipe(
            tap((response: any) => {
                this._data.next(response);
            }),
        );
    }
    
    addClient(client: any): Observable<any> {
        return this._httpClient.post<any>(environment.baseApi + rest.clients, client);
    }

    updateClient(client: any): Observable<any> {
        return this._httpClient.put<any>(`${environment.baseApi + rest.clients}/${client.id}`, client);
    }

    getClientById(id: string): Observable<any> {
        return this._httpClient.get<any>(`${environment.baseApi + rest.clients}/${id}`);
    }

    deleteClient(id: string): Observable<any> {
        return this._httpClient.delete<any>(`${environment.baseApi + rest.clients}/${id}`);
    }

    updateMockTest(data: any): Observable<any> {
        return this._httpClient.put<any>(`${environment.baseApi + rest.mockTest}/${data.id}`, data);
    }
    addMockTest(data: any): Observable<any> {
        return this._httpClient.post<any>(environment.baseApi + rest.mockTest, data);
    }
    deleteMockTest(id: string): Observable<any> {
        return this._httpClient.delete<any>(`${environment.baseApi + rest.mockTest}/${id}`);
    }
}

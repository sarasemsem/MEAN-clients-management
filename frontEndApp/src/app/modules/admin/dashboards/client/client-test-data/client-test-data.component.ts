import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { Subject, takeUntil,filter  } from 'rxjs';
import { MatDrawer, MatDrawerToggleResult, MatSidenavModule } from '@angular/material/sidenav';
import { ClientService } from '../client.service';
import { ClientComponent } from '../client.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-client-test-data',
  standalone: true,
  imports: [CommonModule,
    FormsModule, ReactiveFormsModule,  MatFormFieldModule, MatInputModule, TextFieldModule, NgFor,
    MatDatepickerModule, DatePipe,MatSelectModule, MatOptionModule,MatDividerModule,
    MatSidenavModule,MatIconModule,RouterOutlet,MatButtonModule,RouterLink,MatMenuModule],
  templateUrl: './client-test-data.component.html',
  styleUrl: './client-test-data.component.scss'
})
export class ClientTestDataComponent {
  client: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side';
  showForm = false; // Control the visibility of the form
    newAppointmentDate: Date;
    newMockTestScore: number | null = null;
    newStation: string;
    isStarted = false;
  /**
   * Constructor
   */
  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _clientService: ClientService,
      private _clientListComponent: ClientComponent,
      private _router: Router,
      private _activatedRoute: ActivatedRoute
  )
  {}

  // Toggle form display
  newAppointment(): void {
    this.showForm = true;
  }
  cancelAppointment(): void {
    this.showForm = false; // Hide the form and return to the information section
  }
  // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    /* ngOnInit(): void
    {
        this._clientListComponent.matDrawer.open();
        console.log('Drawer is opening...');
        this._clientService.data$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            console.log('Client data received:', data);
            this.client = data;
            this._clientListComponent.matDrawer.open();
            this._changeDetectorRef.markForCheck();
          });
    } */

          ngOnInit(): void {
            this._clientService.selectedClient$
                .pipe(
                    takeUntil(this._unsubscribeAll),
                    filter(client => !!client) // Only trigger when the client is loaded
                )
                .subscribe(client => {
                    this.client = client;
                    console.log('Client loaded in sidenav:', this.client);
                    this.matDrawer.open(); // Open the drawer when client data is received
                    this._changeDetectorRef.markForCheck();
                });
        }
        
           // Save the appointment
    saveAppointment() {
      const newTest = {
          clientId: this.client._id,
          testAppoinment: this.newAppointmentDate,
          MockTestScore: this.newMockTestScore,
          beginTest: this.isStarted,
          adressMac: this.newStation,
      };
      this._clientService.updateClient({ ...newTest}).subscribe(() => {
        console.log("updated");
    });
      // Add the new test to the client
      this.client.tests.push(newTest);
      this.showForm = false; // Return to information view
  }
     // Method to open client details
  openClientDetails(clientId: string): void {
    this._clientService.getClientById(clientId).subscribe((data) => {
      this.client = data; // Store the client data
      console.log('Client data received:', data);
      this._clientListComponent.matDrawer.open(); // Open the side panel
      this._changeDetectorRef.markForCheck();
    });
  }
      // Toggle the test as started
      toggleCompleted() {
        this.isStarted = !this.isStarted;
        if (this.isStarted) {
            this.newMockTestScore = null; // Reset score if test is started
        }
    }
  onBackdropClicked(): void {
    // Go back to the list
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });

    // Mark for check
    this._changeDetectorRef.markForCheck();
}
     /**
     * On destroy
     */
     ngOnDestroy(): void
     {
         // Unsubscribe from all subscriptions
         this._unsubscribeAll.next(null);
         this._unsubscribeAll.complete();
     }
/**
     * Close the drawer
     */
closeDrawer(): Promise<MatDrawerToggleResult>
{
    return this._clientListComponent.matDrawer.close();
}

/**
 * Track by function for ngFor loops
 *
 * @param index
 * @param item
 */
trackByFn(index: number, item: any): any
{
    return item.id || index;
}

}

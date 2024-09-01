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
import { FuseConfirmationConfig, FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    isEditing = false;
    toEditTest :string;
  /**
   * Constructor
   */
  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _clientService: ClientService,
      private _clientListComponent: ClientComponent,
      private _router: Router,
      private _snackBar: MatSnackBar,
      private _fuseConfirmationService: FuseConfirmationService,
      private _activatedRoute: ActivatedRoute
  )
  {}
  // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
          ngOnInit(): void {
            this.getClientData();
        }
        getClientData() {
          this._clientService.selectedClient$
          .pipe(
              takeUntil(this._unsubscribeAll),
              filter(client => !!client) // Only trigger when the client is loaded
          )
          .subscribe(client => {
              this.client = client;
              console.log('Client loaded in sidenav:', this.client);
              this._changeDetectorRef.markForCheck();
          });
        }
        // Toggle form display
  newAppointment(): void {
    this.showForm = true;
    this.isStarted = false;
    this.isEditing = false;
    this.newAppointmentDate = new Date();
    this.newMockTestScore = null;
    this.newStation = '';
  }
  cancelAppointment(): void {
    this.showForm = false; // Hide the form and return to the information section
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
      if(!this.isEditing)
      {
      this._clientService.addMockTest({ ...newTest}).subscribe(() => {
        // Refresh the data after successful deletion
        this._clientService.getClientById(this.client._id).subscribe((data) => {
          this.client = data; // Store the client data
          console.log('Test data received:', data);
          this._clientListComponent.matDrawer.open(); // Open the side panel
          this._changeDetectorRef.markForCheck();
        });
        this._snackBar.open('Test added successfully!', '', {
          horizontalPosition: 'end',
          verticalPosition: 'top',
          duration: 2000,
      });
    }, (error) => {
      this._snackBar.open('Failed to save the Test!', '', {
        horizontalPosition: 'end',
        verticalPosition: 'top',
        duration: 2000,
    });
    });
      this.showForm = false; // Return to information view
  }
  else
  {
    this.updateTest();
    this.showForm = false; // Return to information view
  }
    }
   
      // Toggle the test as started
      toggleCompleted() {
        this.isStarted = !this.isStarted;
        if (this.isStarted) {
            this.newMockTestScore = null; // Reset score if test is started
        }
    }
    showEditForm(row: any) {
      this.showForm = true;
      this.isEditing = true;
      this.newAppointmentDate = row.testAppoinment;
      this.newMockTestScore = row.MockTestScore;
      this.newStation = row.adressMac; 
      this.isStarted = row.beginTest;
      this.toEditTest = row._id;
    }
    updateTest() {
      console.log(this.toEditTest);
      this._clientService.updateMockTest({ ...this.newAppointmentDate,testAppoinment: this.newAppointmentDate,MockTestScore: this.newMockTestScore,beginTest: this.isStarted,adressMac: this.newStation, id: this.toEditTest}).subscribe(() => {
        this._snackBar.open('Test updated successfully!', '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 2000,
        });
        console.log("updated");
    } , (error) => {
      this._snackBar.open('Failed to update the Test!', '', {
        horizontalPosition: 'end',
        verticalPosition: 'top',
        duration: 2000,
    });
    });
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
openConfirmationDialog(data: any): void {
  const config: FuseConfirmationConfig = {
      title: 'Remove client',
      message: 'Are you sure you want to remove the Test information permanently? <span class="font-medium">This action cannot be undone!</span>',
      icon: {
          show: true,
          name: 'heroicons_outline:exclamation-triangle',
          color: 'warn',
      },
      actions: {
          confirm: {
              show: true,
              label: 'Remove',
              color: 'warn',
          },
          cancel: {
              show: true,
              label: 'Cancel',
          },
      },
      dismissible: true,
  };

  // Open the dialog and save the reference of it
  const dialogRef = this._fuseConfirmationService.open(config);

  // Subscribe to afterClosed from the dialog reference
  dialogRef.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
          // Delete
          this.deleteMockTest(data._id);
      }
      console.log(result);
  });
}
deleteMockTest(id: string): void {
  this._clientService.deleteMockTest(id).subscribe(
      () => {
          // Refresh the data after successful deletion
          this._clientService.getClientById(this.client._id).subscribe((data) => {
            this.client = data; // Store the client data
            console.log('Test data received:', data);
            this._clientListComponent.matDrawer.open(); // Open the side panel
            this._changeDetectorRef.markForCheck();
          });

          this._snackBar.open('Test deleted successfully!', '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 2000,
          });
      },
      (error) => {
          this._snackBar.open('Failed to delete Test. Please try again.', '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 2000,
          });
      }
  );
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



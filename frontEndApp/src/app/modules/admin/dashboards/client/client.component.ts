import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@fuse/auth/service/auth.service';
import { FuseConfirmationConfig, FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { ClientService } from 'app/modules/admin/dashboards/client/client.service';
import { Subject, takeUntil } from 'rxjs';
import { ClientTestDataComponent } from './client-test-data/client-test-data.component';

@Component({
    selector: 'client',
    templateUrl: './client.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ClientTestDataComponent,TranslocoModule, MatSidenavModule,RouterLink, MatIconModule, RouterOutlet, MatButtonModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgFor, NgIf, MatTableModule, NgClass, DatePipe],
    styles: [`
    .fixed-column {
            position: -webkit-sticky; /* For Safari */
            position: sticky;
            right: 0;
            background: white; /* Ensure the background matches your table */
            z-index: 2; /* Ensure it is above other columns */
        }
        .mat-header-cell, .mat-cell {
            white-space: nowrap;
        }
        .mat-header-cell.fixed-column, .mat-cell.fixed-column {
            min-width: 120px; /* Adjust based on your content */
            max-width: 120px; /* Adjust based on your content */
            box-shadow: 2px 0 5px -2px rgba(0,0,0,0.2); /* Optional: Add a shadow for better separation */
        }    
    `]
})
export class ClientComponent implements OnInit, OnDestroy {
    data: any;
    username: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side';
    selectedItem: any;
    /**
     * Constructor
     */

    constructor(private authService: AuthService,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private _clientService: ClientService,
        private _router: Router, private _fuseConfirmationService: FuseConfirmationService) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.username = this.authService.getUser().firstName;
        // Get the data
        this._clientService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;
            });
        console.log(this.data);
    }

     /*  openTestDetails(clientId: string): void {
        this._clientService.getClientById(clientId).subscribe(client => {
            this._clientService.setSelectedClient(client); // Set the selected client correctly
            this.matDrawer.open(); // Open the drawer after client is set
        });
    } */
    openTestDetails(clientId: string): void {
        this._clientService.getClientById(clientId).subscribe(client => {
            this._clientService.setSelectedClient(client); // Set the selected client
            this._changeDetectorRef.markForCheck(); // Ensure the view updates
            this.matDrawer.open(); // Open the drawer
        });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    /**
 * On backdrop clicked
 */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
        this.matDrawer.close();
         
    }
    editClient(row: any) {
        this._router.navigate([`dashboards/clients/new/${row._id}`]);
    }
    createClient() {
        this._router.navigate(['dashboards/clients/new']);
    }
    deleteClient(id: string): void {
        this._clientService.deleteClient(id).subscribe(
            () => {
                // Refresh the data after successful deletion
                this._clientService.getData().subscribe((data) => {
                    // Store the data
                    this.data = data;
                });
                this._snackBar.open('Client deleted successfully!', '', {
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    duration: 2000,
                });
            },
            (error) => {
                this._snackBar.open('Failed to delete client. Please try again.', '', {
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    duration: 2000,
                });
            }
        );
    }
    openConfirmationDialog(data: any): void {
        const config: FuseConfirmationConfig = {
            title: 'Remove client',
            message: 'Are you sure you want to remove this client permanently? <span class="font-medium">This action cannot be undone!</span>',
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
                this.deleteClient(data._id);
            }
            console.log(result);
        });
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------


}

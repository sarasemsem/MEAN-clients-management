import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FuseConfirmationConfig, FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/modules/admin/dashboards/user/user.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, NgApexchartsModule, MatTableModule, MatSortModule, NgClass, MatProgressBarModule, CurrencyPipe, DatePipe],
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('recentTransactionsTable', { read: MatSort }) recentTransactionsTable: MatSort;

    data: any;
    accountBalanceOptions: ApexOptions;
    userDataSource: MatTableDataSource<any> = new MatTableDataSource();
    userTableColumns: string[] = ['firstName', 'lastName', 'email', 'isAdmin', 'action'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    adminsNmb: number = 0;
    usersNmb: number = 0;
    /**
     * Constructor
     */
    constructor(private _snackBar: MatSnackBar, 
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router, private _userService: UserService) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        console.log("Fetching data...");
        // Get the data
        this._userService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Log the received data
                console.log("Received data:", data);

                // Store the data
                this.data = data;

                // If the data is an array, log each item
                if (Array.isArray(this.data)) {
                    this.adminsNmb = data.filter(user => user.isAdmin).length;
                    this.usersNmb = data.filter(user => !user.isAdmin).length;
                    this.data.forEach((item, index) => {
                        console.log(`Item ${index}:`, item);
                    });
                }

                // Assuming data.recentTransactions is a valid path
                this.userDataSource.data = data.recentTransactions || data;
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Make the data source sortable
        this.userDataSource.sort = this.recentTransactionsTable;
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
    createUser() {
        this._router.navigate(['dashboards/settings/new']);
    }
    editUser(user: any): void {
        console.log("Editing user:", user);
        this._router.navigate([`dashboards/settings/update/${user._id}`]);
    }

    deleteUser(id: any): void {
        console.log("Deleting user:", id);
        this._userService.deleteUser(id).subscribe(
            () => {
                // Refresh the data after successful deletion
               this._userService.getData().subscribe((data) => {
                // Store the data
                this.data = data;
            });
                this._snackBar.open('User deleted successfully!', '', {
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    duration: 2000,
                });
            },
            (error) => {
                this._snackBar.open('Failed to delete the use. Please try again.', '', {
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    duration: 2000,
                });
            }
        );
    }

    openConfirmationDialog(data : any): void
    {   
        const config: FuseConfirmationConfig = {
            title: 'Remove contact',
            message: 'Are you sure you want to remove this user permanently? <span class="font-medium">This action cannot be undone!</span>',
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn' as 'warn' | 'error' | 'primary' | 'accent' | 'basic' | 'info' | 'success' | 'warning',
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
        dialogRef.afterClosed().subscribe((result) =>
        {
            // If the confirm button pressed...
            if (result === 'confirmed')
            {
                // Delete
                this.deleteUser(data._id);
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
}

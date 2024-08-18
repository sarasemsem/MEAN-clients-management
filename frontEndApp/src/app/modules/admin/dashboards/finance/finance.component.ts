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
import { UserService } from 'app/modules/admin/dashboards/finance/user.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'finance',
    templateUrl: './finance.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, NgApexchartsModule, MatTableModule, MatSortModule, NgClass, MatProgressBarModule, CurrencyPipe, DatePipe],
})
export class FinanceComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('recentTransactionsTable', { read: MatSort }) recentTransactionsTable: MatSort;

    data: any;
    accountBalanceOptions: ApexOptions;
    userDataSource: MatTableDataSource<any> = new MatTableDataSource();
    userTableColumns: string[] = ['firstName', 'lastName', 'email', 'isAdmin', 'action'];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _snackBar: MatSnackBar, private _router: Router, private _userService: UserService) { }

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

    editUser(user: any): void {
        console.log("Editing user:", user);
        this._router.navigate([`dashboards/settings/update/${user._id}`]);
    }

    deleteUser(user: any): void {
        console.log("Deleting user:", user);
        this._userService.deleteUser(user._id).subscribe(
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

import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService } from '@fuse/auth/service/auth.service';
import { FuseConfirmationConfig, FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { ClientService } from 'app/modules/admin/dashboards/project/client.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'client',
    templateUrl: './client.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslocoModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, NgIf, MatTableModule, NgClass,CurrencyPipe, DatePipe],
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
export class ProjectComponent implements OnInit, OnDestroy {

    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    data: any;
    username: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */

    constructor(private authService: AuthService ,private _snackBar: MatSnackBar,private _clientService: ClientService, private _router: Router,private _fuseConfirmationService: FuseConfirmationService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.username =this.authService.getUser().firstName; 
        // Get the data
        this._clientService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });
            console.log(this.data);
        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };
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
    openConfirmationDialog(data : any): void
    {   
        const config: FuseConfirmationConfig = {
            title: 'Remove contact',
            message: 'Are you sure you want to remove this client permanently? <span class="font-medium">This action cannot be undone!</span>',
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

    /**
     * Fix SVG fill references. This fix must be applied to all ApexCharts
     * in order to fix 'black color issues on certain browsers' caused by
     * '<use> SVG elements' that don't inherit 'fill' attribute correctly
     * from their parents.
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all <use> elements
        // 2. Iterate through them
        // 3. Get the 'href' attribute
        // 4. Check if the 'href' attribute starts with '#'
        // 5. If it does, prepend the current URL
        Array.from(element.querySelectorAll('*[fill]')).forEach((el) => {
            const fill = el.getAttribute('fill');

            if (fill?.indexOf('url(') !== -1) {
                el.setAttribute('fill', 'url(' + currentURL + fill.split('url(')[1]);
            }
        });
    }

    /**
     * Prepare the chart data from the data
     */private _prepareChartData(): void {
    // Weekly expensesj
    this.chartWeeklyExpenses = {
        chart: {
            animations: {
                enabled: false,
            },
            fontFamily: 'inherit',
            foreColor: 'var(--fuse-text-secondary)',
            height: '100%',
            type: 'line', // Change type to 'line' for line chart
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        colors: ['#22D3EE'],
        dataLabels: {
            enabled: true,
            formatter: (val: number): string => `${val}%`,
            textAnchor: 'start',
            style: {
                fontSize: '13px',
                fontWeight: 500,
            },
            background: {
                borderWidth: 0,
                padding: 4,
            },
            offsetY: -15,
        },
        markers: {
            strokeColors: '#818CF8',
            strokeWidth: 4,
        },
        plotOptions: {
            radar: {
                polygons: {
                    strokeColors   : 'var(--fuse-border)',
                    connectorColors: 'var(--fuse-border)',
                },
            },
        },
        fill: {
            opacity: 0.5,
        },
        grid: {
            borderColor: 'var(--fuse-border)',
            position: 'back',
            show: false,
            strokeDashArray: 6,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
        series: [{
            name: 'Weekly Mock Test Scores',
            data: this.data.map((item: any) => ({ x: item.testAppoinment, y: item.MockTestScore }))
        }],
        stroke: {
            curve: 'smooth',
        },
        tooltip: {
            followCursor: true,
            theme: 'dark',
        },
        xaxis: {
            type: 'category',
            categories: this.data.map((item: any) => item.testAppoinment),
        },
        yaxis: {
            labels: {
                formatter: (val): string => `${val}`, // Adjust formatting if needed
            },
            show: false,
        },
    };

    // Monthly expenses
    this.chartMonthlyExpenses = {
        chart: {
            animations: {
                enabled: false,
            },
            fontFamily: 'inherit',
            foreColor: 'var(--fuse-text-secondary)',
            height: '100%',
            type: 'line', // Change type to 'line' for line chart
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        colors: ['#4ADE80'],
        dataLabels: {
            enabled: false,
        },
        fill: {
            opacity: 0.5,
        },
        grid: {
            borderColor: 'var(--fuse-border)',
            position: 'back',
            show: false,
            strokeDashArray: 6,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
        legend: {
            show: false,
        },
        series: [{
            name: 'Monthly Mock Test Scores',
            data: this.data.map((item: any) => ({ x: item.testAppoinment, y: item.MockTestScore }))
        }],
        stroke: {
            curve: 'smooth',
        },
        tooltip: {
            followCursor: true,
            theme: 'dark',
        },
        xaxis: {
            type: 'category',
            categories: this.data.map((item: any) => item.testAppoinment),
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            }
        },
        yaxis: {
            show: false,
        }
    };
    // Add similar configurations for yearly expenses if needed.
}

}

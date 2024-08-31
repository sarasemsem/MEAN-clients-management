import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { ClientComponent } from 'app/modules/admin/dashboards/client/client.component';
import { ClientService } from 'app/modules/admin/dashboards/client/client.service';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';
import { ClientTestDataComponent } from './client-test-data/client-test-data.component';
/**
 * Can deactivate file manager details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateClientDetails = (
    component: ClientTestDataComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot) =>
{
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while ( nextRoute.firstChild )
    {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/file-manager'
    // it means we are navigating away from the
    // file manager app
    if ( !nextState.url.includes('/clients') )
    {
        // Let it navigate
        return true;
    }

    // If we are navigating to another item...
    if ( nextState.url.includes('/details') )
    {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};
export default [
    {
        path     : '',
        component: ClientComponent,
        resolve  : {
            data: () => inject(ClientService).getData(),
        },
    },
    {
        path     : 'new',
        component: AddEditClientComponent,
    },
    {
        path     : 'new/:id',
        component: AddEditClientComponent,
    },
    {
        path     : 'details/:id',
        component    : ClientTestDataComponent,
        canDeactivate: [canDeactivateClientDetails],
    }
] as Routes;

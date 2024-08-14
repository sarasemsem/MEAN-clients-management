import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import { ClientService } from 'app/modules/admin/dashboards/project/project.service';
import { AddEditClientComponent } from './add-edit-client/add-edit-client.component';

export default [
    {
        path     : '',
        component: ProjectComponent,
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
    }
] as Routes;

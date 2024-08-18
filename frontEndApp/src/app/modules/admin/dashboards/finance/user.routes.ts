import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { UsersComponent } from 'app/modules/admin/dashboards/finance/user.component';
import { UserService } from 'app/modules/admin/dashboards/finance/user.service';
import { AddEditUserComponent } from './add-edit-user/add-edit-user.component';

export default [
    {
        path     : '',
        component: UsersComponent,
        resolve  : {
            data: () => inject(UserService).getData(),
        },
    },
    {
        path     : 'update/:id',
        component: AddEditUserComponent,
    },
    {
        path     : 'new',
        component: AddEditUserComponent,
    }
] as Routes;

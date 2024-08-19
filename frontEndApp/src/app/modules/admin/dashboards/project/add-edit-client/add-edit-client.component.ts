import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgClass, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-add-edit-client',
    templateUrl: './add-edit-client.component.html',
    styleUrls: ['./add-edit-client.component.scss'],
    standalone   : true,
    imports      : [NgIf, MatIconModule, FormsModule, MatFormFieldModule, NgClass, MatInputModule, TextFieldModule, ReactiveFormsModule, MatButtonToggleModule, MatButtonModule, MatSelectModule, MatOptionModule, MatChipsModule, MatDatepickerModule],

})
export class AddEditClientComponent implements OnInit {
    clientForm: FormGroup;
    isEditMode = false;
    clientId: string;

    constructor(
        private _snackBar: MatSnackBar,
        private fb: FormBuilder,
        private clientService: ClientService,
        private router: Router,
        private route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.clientForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.email]],
            phone: ['', Validators.required],
            address: [''],
            testAppoinment: [''],
            MockTestScore: [null, [Validators.pattern('^[0-9]*\\.?[0-9]+$')]] // Allows decimal numbers
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            console.log(params);
            if (params['id']) {
                this.isEditMode = true;
                this.clientId = params['id'];
                this.clientService.getClientById(this.clientId).subscribe((client) => {
                    this.clientForm.patchValue(client);
                });
            }
        });
    }

    onSave(): void {
        if (this.clientForm.valid) {
            if (this.isEditMode) {
                this.clientService.updateClient({ ...this.clientForm.value, id: this.clientId }).subscribe(() => {
                    //this.router.navigate(['dashboards/clients']);
                    this._snackBar.open('Client deleted successfully!', '', {
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        duration: 2000,
                    });
                    console.log("updated");
                });
            } else {
                this.clientService.addClient(this.clientForm.value).subscribe(() => {
                    this.router.navigate(['dashboards/clients']);
                });
            }
        }
    }

    onCancel(): void {
        this.router.navigate(['dashboards/clients']);
    }
}

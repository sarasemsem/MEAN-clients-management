import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    NgClass,
    MatInputModule,
    TextFieldModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss']
})
export class AddEditUserComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  user = null;
  userId: string;

  constructor(
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: [''],
      isAdmin: [false, Validators.required], 
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        this.userService.getUserById(this.userId).subscribe({
          next: (data) => {
            this.user = data.data;
            this.userForm.patchValue({
              ...this.user,
              isAdmin: this.user.isAdmin // Ensure the value matches the form control
            });
          // Ensure the form fields are filled correctly
          this.userForm.get('password').setValue('');
          this.userForm.get('confirmPassword').setValue('');
          //this.userForm.get('isAdmin').setValue(this.user.isAdmin);
          // Manually trigger change detection if necessary
          this.cd.detectChanges();
          },
          error: (err) => {
            console.error(err);
          }
    });
  }
});
  }
  

  onSave(): void {
    if (this.userForm.valid) {
      if (this.isEditMode) {
        this.userService.updateUser({ ...this.userForm.value, id: this.userId }).subscribe(() => {
          this._snackBar.open('User updated successfully!', '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 2000,
          });
          this.router.navigate(['dashboards/settings']);
        });
      } else {
        this.userService.addUser(this.userForm.value).subscribe(() => {
          this._snackBar.open('User added successfully!', '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 2000,
          });
          this.router.navigate(['dashboards/settings']);
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['dashboards/clients']);
  }

  // Custom validator to check if the password and confirm password fields match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
}

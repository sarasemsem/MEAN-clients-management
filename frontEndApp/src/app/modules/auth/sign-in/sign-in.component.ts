import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from '@fuse/auth/service/auth.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit
{   errorMessage: string = "";
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._authService.clear();
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['admin@superadmin.com', [Validators.required, Validators.email]],
            password  : ['123', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
      // Return if the form is invalid
      if (this.signInForm.invalid) {
          return;
      }
  
      // Disable the form
      this.signInForm.disable();
  
      // Hide the alert
      this.showAlert = false;
  
      // Sign in
      this._authService.signIn({
          email: this.signInForm.value.email,
          password: this.signInForm.value.password
      }).subscribe(
          (response) => {
              // Log the response for debugging
              console.log('Login response:', response);
  
              // Re-enable the form
              this.signInForm.enable();
  
              // Check if response contains the expected data
              if (response && response.data.user.token) {
                  // Get the redirect URL from the query parameters or default to '/'
                  const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                  console.log('Redirect URL:', redirectURL);
  
                  // Navigate to the redirect URL
                  this._router.navigateByUrl(redirectURL);
              } else {
                  // Handle unexpected response structure
                  this.errorMessage = 'Unexpected response from the server';
                  this.alert = {
                      type: 'error',
                      message: this.errorMessage,
                  };
                  this.showAlert = true;
              }
          },
          (error) => {
              // Log the error for debugging
              console.log('Login error:', error);
  
              // Re-enable the form
              this.signInForm.enable();
  
              // Reset the form
              this.signInNgForm.resetForm();
  
              // Set the error message based on the error status
              if (error.status === 404 || error.message === "Request failed with status code 404") {
                  this.errorMessage = 'Wrong email or password';
              } else {
                  this.errorMessage = 'Server Error';
              }
  
              // Set the alert
              this.alert = {
                  type: 'error',
                  message: this.errorMessage,
              };
  
              // Show the alert
              this.showAlert = true;
          }
      );
  }
  
}

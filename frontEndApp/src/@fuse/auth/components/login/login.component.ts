import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { EmailsService } from 'src/app/private/service/email/emails.service';
import { NotificationBarComponent } from 'src/app/private/components/notification-bar/notification-bar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  login: string = "";
  password: string = "";
  errorMessage: string = "";
  durationInSeconds = 5;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar, private emailService:EmailsService) {}

  ngOnInit(): void {
    this.authService.clear();
    this.authService.clearCache().subscribe(  
      (response) => {
        console.log("Success: " + response.message); // Log the message property
      },
      (error) => {
        console.error("Error: " + error); // Log error message
      }
);
  }

  onSubmitLogin(): void {
    this.authService.request(
      "POST",
      "/login",
      {
        "email": this.login,
        "password": this.password
      }
    ).then(response => {
      this.authService.setAuthToken(response.data.langKey);
      this.authService.setRoles(response.data.roles);
      this.authService.setUser(response.data.userId, response.data.firstName, response.data.email);
      this.router.navigate(['/']);
      this.openSnackBar("Connected");
    }).catch(error => {
      console.log(error.message==="Request failed with status code 404");
      if (error.message==="Request failed with status code 404" ) {
        this.errorMessage = 'Wrong email or password';
      }
      else if (error.status === 404 ) {
        this.errorMessage = 'Wrong email or password';
      } else {
        this.errorMessage = 'Server Error';
      }
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(NotificationBarComponent, {
      duration: this.durationInSeconds * 1000,
      data: { message }
    }); 
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}

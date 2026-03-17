import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';

  // Register form fields
  regEmail = '';
  regPassword = '';
  regConfirmPassword = '';
  regPhoneNumber = '';
  regAccountNumber = '';
  regErrorMessage = '';
  regSuccessMessage = '';

  showRegister = false;

  constructor(private router: Router, private auth: AuthService) {}
  
  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.errorMessage = '';
    this.regErrorMessage = '';
    this.regSuccessMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.ok) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password.';
        }
      },
      error: (err) => {
        if (err?.status === 401) {
          this.showRegister = true;
        } else {
          this.errorMessage = err?.error?.error || 'Login failed.';
        }
      }
    });
  }

  onRegister() {
    if (this.regPassword !== this.regConfirmPassword) {
      this.regErrorMessage = 'Passwords do not match.';
      this.regSuccessMessage = '';
      return;
    }

    if (this.regPhoneNumber.length !== 10) {
      this.regErrorMessage = 'Phone number must be exactly 10 digits.';
      this.regSuccessMessage = '';
      return;
    }

    if (this.regAccountNumber.length !== 12) {
      this.regErrorMessage = 'Account number must be exactly 12 digits.';
      this.regSuccessMessage = '';
      return;
    }
    this.regErrorMessage = '';
    this.auth.register({
      email: this.regEmail,
      password: this.regPassword,
      phoneNumber: this.regPhoneNumber,
      accountNumber: this.regAccountNumber
    }).subscribe({
      next: (res) => {
        if (res.ok) {
          this.regSuccessMessage = 'Registration successful! You can now log in.';
          this.email = this.regEmail;
          this.password = this.regPassword;
          this.showRegister = false;
        } else {
          this.regErrorMessage = 'Registration failed.';
        }
      },
      error: (err) => {
        this.regErrorMessage = err?.error?.error || 'Registration failed.';
      }
    });
  }
}


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  phoneNumber = '';
  accountNumber = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router, 
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onRegister() {
    // ... validation logic ...
    // (I'll keep the existing validation but wrap the success logic)
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.successMessage = '';
      return;
    }

    if (this.phoneNumber.length !== 10) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';
      this.successMessage = '';
      return;
    }

    if (this.accountNumber.length !== 12) {
      this.errorMessage = 'Account number must be exactly 12 digits.';
      this.successMessage = '';
      return;
    }
    this.errorMessage = '';
    this.auth.register({
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber,
      accountNumber: this.accountNumber
    }).subscribe({
      next: (res) => {
        if (res.ok) {
          this.successMessage = 'Registration successful! Redirecting to login...';
          this.notificationService.addNotification({
            type: 'security',
            title: 'Mobile Registered',
            message: `Mobile number +91 ${this.phoneNumber} has been successfully registered to your account.`,
            priority: 'medium'
          });
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.errorMessage = 'Registration failed.';
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.error || 'Registration failed.';
      }
    });
  }
}


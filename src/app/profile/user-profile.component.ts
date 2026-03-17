import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  balance: number = 0;
  
  // Mock Stats
  joinDate: Date = new Date();
  activeInvestments = 4;
  totalReturns = '+12.5%';

  // Settings
  emailAlerts = true;
  smsAlerts = false;
  twoFactor = true;

  isVerifying = false;
  isVerified = false;
  securityScore = 65;
  isSendingTest = false;
  isConfigured = true; // We'll assume true for UI visibility, backend will handle the check
  phoneNumber: string = ''; // Assuming phoneNumber is needed for SMS functionality

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {
    // Set mock join date to 6 months ago
    this.joinDate.setMonth(this.joinDate.getMonth() - 6);
  }

  ngOnInit(): void {
    this.user = this.authService.getUserProfile();
    this.phoneNumber = this.user?.phoneNumber || '';
    this.walletService.walletState$.subscribe(state => {
      this.balance = state.balance;
    });
    this.calculateSecurityScore();
  }

  calculateSecurityScore() {
    let score = 40;
    if (this.twoFactor) score += 20;
    if (this.emailAlerts) score += 10;
    if (this.smsAlerts) score += 10;
    if (this.isVerified) score += 20;
    this.securityScore = score;
  }

  verifyMobile() {
    this.isVerifying = true;
    setTimeout(() => {
      this.isVerifying = false;
      this.isVerified = true;
      this.calculateSecurityScore();
      this.notificationService.addNotification({
        type: 'security',
        title: 'Mobile Verified',
        message: 'Your mobile number has been successfully verified.',
        priority: 'high'
      });
    }, 2000);
  }

  testSmsConnection() {
    this.isSendingTest = true;
    const testPhone = this.user?.phoneNumber || this.phoneNumber;
    const message = `Antigravity Verification: Your real-time SMS connection is active! Secure trading enabled.`;
    
    this.notificationService.sendSMSRequest(testPhone, message).subscribe({
      next: () => {
        this.isSendingTest = false;
        this.notificationService.addNotification({
          type: 'security',
          title: 'Connection Active',
          message: 'Test SMS successfully handed off to gateway.',
          priority: 'medium'
        });
      },
      error: (err) => {
        this.isSendingTest = false;
        const errMsg = err?.error?.error === 'CONFIG_REQUIRED' 
          ? 'Setup Required: Twilio keys missing in backend/.env'
          : 'Delivery Failed: Check your Twilio balance/keys.';
          
        this.notificationService.addNotification({
          type: 'security',
          title: 'Test Failed',
          message: errMsg,
          priority: 'high'
        });
      }
    });
  }

  toggleEmailAlerts() {
    this.emailAlerts = !this.emailAlerts;
    this.calculateSecurityScore();
    this.notificationService.addNotification({
      type: 'system',
      title: 'Settings Updated',
      message: `Email alerts ${this.emailAlerts ? 'enabled' : 'disabled'}.`,
      priority: 'low'
    });
  }

  toggleSmsAlerts() {
    this.smsAlerts = !this.smsAlerts;
    this.calculateSecurityScore();
    this.notificationService.addNotification({
      type: 'system',
      title: 'Settings Updated',
      message: `SMS alerts ${this.smsAlerts ? 'enabled' : 'disabled'}.`,
      priority: 'low'
    });
  }

  toggleTwoFactor() {
    this.twoFactor = !this.twoFactor;
    this.calculateSecurityScore();
    const action = this.twoFactor ? 'enabled' : 'disabled';
    this.notificationService.addNotification({
      type: 'security',
      title: 'Security Updated',
      message: `Two-factor authentication ${action}.`,
      priority: 'high'
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { WalletService } from './wallet.service';
import { WalletState } from './wallet.types';
import { StockService } from '../stock.service';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  walletState: WalletState | null = null;
  userProfile: any = null;
  activeFilter: 'all' | 'deposit' | 'withdrawal' = 'all';
  
  // UI State
  showAddModal = false;
  showWithdrawModal = false;
  isProcessing = false;
  paymentMethod = 'phonepe'; // default
  amount = 1000;
  withdrawAccount = 'HDFC Bank - **** 1234';

  constructor(
    private walletService: WalletService,
    private stockService: StockService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.walletService.walletState$.subscribe((state: WalletState | null) => {
      this.walletState = state;
    });
    
    // Fetch user profile for the digital card
    const profile = this.auth.getUserProfile();
    if (profile) {
      this.userProfile = profile;
    }
    this.walletService.refreshWallet();
  }

  get filteredTransactions() {
    if (!this.walletState) return [];
    if (this.activeFilter === 'all') return this.walletState.transactions;
    return this.walletState.transactions.filter(t => t.type === this.activeFilter);
  }

  setFilter(filter: 'all' | 'deposit' | 'withdrawal') {
    this.activeFilter = filter;
  }

  openAddModal() {
    this.showAddModal = true;
    this.amount = 1000;
  }

  openWithdrawModal() {
    this.showWithdrawModal = true;
    // Default withdraw amount suggestion
    this.amount = 500;
  }

  closeModals() {
    this.showAddModal = false;
    this.showWithdrawModal = false;
    this.isProcessing = false;
  }

  processAddFunds() {
    if (this.amount < 100) return;
    this.isProcessing = true;
    
    // Instead of mock delay, call our Node backend to create an actual order
    this.walletService.createRazorpayOrder(this.amount).subscribe({
      next: (res) => {
        if (res.ok && res.order) {
          this.openRazorpayCheckout(res.order);
        } else {
          alert('Failed to initialize payment.');
          this.isProcessing = false;
        }
      },
      error: () => {
        alert('Server error connecting to payment gateway.');
        this.isProcessing = false;
      }
    });
  }

  openRazorpayCheckout(order: any) {
    const options = {
      key: 'rzp_test_mock1234567890', // Keep in sync with backend test key
      amount: order.amount,
      currency: order.currency,
      name: 'AI Stock Prediction',
      description: 'Wallet Top-up',
      order_id: order.id,
      handler: (response: any) => {
        // Payment succeeded, now verify signature securely on backend
        this.verifyPayment(response);
      },
      prefill: {
        name: this.userProfile?.name || 'Investor',
        email: this.userProfile?.email || 'user@example.com',
        contact: this.userProfile?.phoneNumber || '9999999999'
      },
      theme: {
        color: '#0d6efd' // Primary brand color
      },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  verifyPayment(response: any) {
    this.walletService.verifyRazorpayPayment(response).subscribe({
      next: (res) => {
        if (res.ok) {
          // Determine friendly string for method display based on user radio selection earlier
          const methodDisplay = this.paymentMethod === 'phonepe' ? 'Razorpay (UPI)' : 'Razorpay (Card)';
          this.walletService.recordVerifiedDeposit(this.amount, methodDisplay);
          this.closeModals();
        } else {
          alert('Payment verification failed.');
          this.isProcessing = false;
        }
      },
      error: () => {
        alert('Payment verified failed due to server error.');
        this.isProcessing = false;
      }
    });
  }

  processWithdrawFunds() {
    if (this.amount <= 0 || !this.walletState || this.amount > this.walletState.balance) return;
    this.isProcessing = true;

    this.walletService.withdrawFunds(this.amount, this.withdrawAccount).subscribe({
      next: (res) => {
        if (res.ok) {
          this.closeModals();
        } else {
          alert(res.error);
          this.isProcessing = false;
        }
      }
    });
  }

  setAmount(val: number) {
    this.amount = val;
  }
}

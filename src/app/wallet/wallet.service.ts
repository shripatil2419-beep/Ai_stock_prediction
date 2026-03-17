import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Transaction, WalletState } from './wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletState = new BehaviorSubject<WalletState>({ balance: 0, transactions: [] });
  walletState$ = this.walletState.asObservable();
  
  private apiUrl = 'http://localhost:3001/api/payment';
  private walletUrl = 'http://localhost:3001/api/wallet';

  constructor(private http: HttpClient) {
    this.refreshWallet();
  }

  private getHeaders() {
    const email = localStorage.getItem('userEmail') || '';
    return { 'x-user-email': email };
  }

  refreshWallet() {
    this.http.get<any>(this.walletUrl, { headers: this.getHeaders() }).subscribe(res => {
      if (res.ok) {
        this.walletState.next({
          balance: res.balance,
          transactions: res.transactions
        });
      }
    });
  }

  getBalance(): number {
    return this.walletState.value.balance;
  }

  // API Call to create Razorpay Order
  createRazorpayOrder(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { amount });
  }

  // API Call to verify Razorpay Payment
  verifyRazorpayPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, paymentData);
  }

  // Update local state after successful real payment
  recordVerifiedDeposit(amount: number, method: string) {
    this.http.post<any>(`${this.walletUrl}/transaction`, 
      { type: 'deposit', amount, method },
      { headers: this.getHeaders() }
    ).subscribe(res => {
      if (res.ok) this.refreshWallet();
    });
  }

  // Simulate Add Funds (Old Method - keeping for UI fallback if needed)
  addFunds(amount: number, method: string): Observable<{ ok: boolean, error?: string }> {
    return new Observable(subscriber => {
      // Simulate API call delay
      setTimeout(() => {
        const state = this.walletState.value;
        const newTxn: Transaction = {
          id: 'txn_' + Math.random().toString(36).substr(2, 9),
          type: 'deposit',
          amount: amount,
          date: new Date().toISOString(),
          status: 'completed',
          method: method
        };

        this.walletState.next({
          balance: state.balance + amount,
          transactions: [newTxn, ...state.transactions]
        });

        subscriber.next({ ok: true });
        subscriber.complete();
      }, 1500); // 1.5s delay for realistic feel
    });
  }

  // Simulate Withdraw Funds
  withdrawFunds(amount: number, accountDetails: string): Observable<{ ok: boolean, error?: string }> {
    return new Observable(subscriber => {
      setTimeout(() => {
        const state = this.walletState.value;
        
        if (amount > state.balance) {
          subscriber.next({ ok: false, error: 'Insufficient balance.' });
          subscriber.complete();
          return;
        }

        const newTxn: Transaction = {
          id: 'txn_' + Math.random().toString(36).substr(2, 9),
          type: 'withdrawal',
          amount: amount,
          date: new Date().toISOString(),
          status: 'completed',
          method: accountDetails
        };

        this.walletState.next({
          balance: state.balance - amount,
          transactions: [newTxn, ...state.transactions]
        });

        subscriber.next({ ok: true });
        subscriber.complete();
      }, 1500);
    });
  }

  // Deduct funds for stock purchase
  spendFunds(amount: number, description: string) {
    this.http.post<any>(`${this.walletUrl}/transaction`, 
      { type: 'withdrawal', amount, method: description },
      { headers: this.getHeaders() }
    ).subscribe(res => {
      if (res.ok) this.refreshWallet();
    });
  }

  // Credit funds from stock sale
  addTradingFunds(amount: number, description: string) {
    this.http.post<any>(`${this.walletUrl}/transaction`, 
      { type: 'deposit', amount, method: description },
      { headers: this.getHeaders() }
    ).subscribe(res => {
      if (res.ok) this.refreshWallet();
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WalletService } from './wallet/wallet.service';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
}

export interface PortfolioSummary {
  totalInvestment: number;
  currentValue: number;
  totalPnL: number;
  pnlPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private portfolioSubject = new BehaviorSubject<Holding[]>([]);
  portfolio$ = this.portfolioSubject.asObservable();
  
  private summarySubject = new BehaviorSubject<PortfolioSummary | null>(null);
  summary$ = this.summarySubject.asObservable();

  constructor(
    private http: HttpClient, 
    private walletService: WalletService,
    private auth: AuthService
  ) {
    this.refreshPortfolio();
  }

  private getHeaders() {
    const email = localStorage.getItem('userEmail') || '';
    return new HttpHeaders().set('x-user-email', email);
  }

  refreshPortfolio() {
    this.http.get<{ok: boolean, holdings: Holding[], summary: PortfolioSummary}>(`${environment.apiUrl}/portfolio`, { headers: this.getHeaders() }).subscribe(res => {
      if (res.ok) {
        this.portfolioSubject.next(res.holdings);
        this.summarySubject.next(res.summary);
      }
    });
  }

  buyStock(symbol: string, shares: number, price: number): Observable<any> {
    const totalCost = shares * price;
    return this.http.post<any>(`${environment.apiUrl}/portfolio/buy`, { symbol, shares, price }, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.ok) {
          this.refreshPortfolio();
        }
      })
    );
  }

  sellStock(symbol: string, shares: number, price: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/portfolio/sell`, { symbol, shares, price }, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.ok) {
          this.refreshPortfolio();
        }
      })
    );
  }
}

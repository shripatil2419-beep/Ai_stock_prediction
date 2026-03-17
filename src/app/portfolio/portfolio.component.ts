import { Component, OnInit } from '@angular/core';
import { PortfolioService, Holding, PortfolioSummary } from '../portfolio.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  holdings: Holding[] = [];
  summary: PortfolioSummary | null = null;
  isLoading = true;
  isProcessing = false;

  constructor(
    private portfolioService: PortfolioService,
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.portfolioService.portfolio$.subscribe(data => this.holdings = data);
    this.portfolioService.summary$.subscribe(sum => {
      this.summary = sum;
      this.isLoading = false;
    });
    this.portfolioService.refreshPortfolio();
  }

  getPnL(holding: Holding): number {
    return (holding.currentPrice - holding.averagePrice) * holding.shares;
  }

  getPnLPercent(holding: Holding): number {
    return ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
  }

  exitTrade(holding: Holding): void {
    if (this.isProcessing) return;
    
    const sellAmount = holding.shares * holding.currentPrice;
    this.isProcessing = true;

    this.portfolioService.sellStock(holding.symbol, holding.shares, holding.currentPrice).subscribe({
      next: (res) => {
        this.walletService.addTradingFunds(sellAmount, `Sold: ${holding.shares} x ${holding.symbol}`);
        this.isProcessing = false;
        this.notificationService.addNotification({
          type: 'system',
          title: 'Trade Closed',
          message: `Closed position in ${holding.symbol}. ₹${sellAmount.toFixed(2)} credited to your wallet.`,
          priority: 'medium'
        });
      },
      error: () => this.isProcessing = false
    });
  }
}

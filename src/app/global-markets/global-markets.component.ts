import { Component, OnInit } from '@angular/core';
import { StockService } from '../stock.service';
import { AuthService } from '../auth.service';
import { GlobalExtendedResponse } from '../stock.types';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-global-markets',
  templateUrl: './global-markets.component.html',
  styleUrls: ['./global-markets.component.scss']
})
export class GlobalMarketsComponent implements OnInit {
  globalData: GlobalExtendedResponse | null = null;
  loading = true;
  error: string | null = null;

  isSendingSms = false;

  constructor(
    private stockService: StockService,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  sendMarketSms(): void {
    if (!this.globalData) return;
    const user = this.auth.getUserProfile();
    if (!user || !user.phoneNumber) {
      this.notificationService.addNotification({
        type: 'security',
        title: 'SMS Failed',
        message: 'No registered mobile number found. Please update your profile.',
        priority: 'high'
      });
      return;
    }

    this.isSendingSms = true;

    const sp500 = this.globalData.indices.find(i => i.name === 'S&P 500');
    const nasdaq = this.globalData.indices.find(i => i.name === 'NASDAQ');
    const gold = this.globalData.commodities.find(c => c.name === 'Gold');

    const message = `Global Alert: S&P 500: ${sp500?.price} (${sp500?.percent}), NASDAQ: ${nasdaq?.price} (${nasdaq?.percent}). Gold: $${gold?.price}. Sent to your linked mobile number.`;

    this.notificationService.sendSMSRequest(user.phoneNumber, message).subscribe({
      next: (res) => {
        this.isSendingSms = false;
        this.notificationService.addNotification({
          type: 'market',
          isSMS: true,
          title: 'Real SMS Sent',
          message: `Update delivered to +91 ${user.phoneNumber}: ${message}`,
          priority: 'medium'
        });
      },
      error: (err) => {
        this.isSendingSms = false;
        const msg = err?.error?.error === 'CONFIG_REQUIRED' 
          ? 'Config Required: Fill in TWILIO_SID and TOKEN in backend/.env for real SMS.'
          : 'SMS Gateway Error: Delivery failed. Check your Twilio account.';

        this.notificationService.addNotification({
          type: 'security',
          title: 'Real SMS Failed',
          message: msg,
          priority: 'high'
        });
      }
    });
  }

  ngOnInit(): void {
    this.fetchGlobalData();
    // Refresh every 15 seconds for live feel
    setInterval(() => this.fetchGlobalData(false), 15000);
  }

  fetchGlobalData(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.stockService.getGlobalExtended().subscribe({
      next: (data) => {
        this.globalData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load global market data.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}

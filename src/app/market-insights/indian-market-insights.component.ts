import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../stock.service';
import { AuthService } from '../auth.service';
import { IndianMarketDataResponse } from '../stock.types';
import { NotificationService } from '../notification.service';
import Chart from 'chart.js/auto';

const LIVE_REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds

@Component({
  selector: 'app-indian-market-insights',
  templateUrl: './indian-market-insights.component.html',
  styleUrls: ['./indian-market-insights.component.scss']
})
export class IndianMarketInsightsComponent implements OnInit, AfterViewInit, OnDestroy {
  marketData: IndianMarketDataResponse | null = null;
  loading = true;
  chart: Chart | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  isSendingSms = false;

  constructor(
    private stock: StockService, 
    private router: Router,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  sendMarketSms(): void {
    if (!this.marketData) return;
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
    
    // Compile current indices for the SMS
    const nifty = this.marketData.indices.find(i => i.name === 'NIFTY 50');
    const sensex = this.marketData.indices.find(i => i.name === 'SENSEX');
    const message = `Market Pulse: NIFTY 50 at ${nifty?.price.toFixed(2)} (${nifty?.changePercent}%), SENSEX at ${sensex?.price.toFixed(2)} (${sensex?.changePercent}%). FII Net: ${this.marketData.fiiDii.fiiNet}Cr.`;

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
          ? 'Configuration Required: Please add your TWILIO keys to backend/.env to send real SMS.'
          : 'Failed to deliver SMS. Ensure your Twilio balance is sufficient.';
        
        this.notificationService.addNotification({
          type: 'security',
          title: 'SMS Delivery Failed',
          message: msg,
          priority: 'high'
        });
      }
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.refreshTimer = setInterval(() => this.fetchData(), LIVE_REFRESH_INTERVAL_MS);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderNiftyChart(), 500);
  }

  fetchData(): void {
    this.loading = true;
    this.stock.getIndianMarketData().subscribe({
      next: (res) => {
        this.marketData = res;
        this.loading = false;
        setTimeout(() => this.renderNiftyChart(), 0);
      },
      error: () => this.loading = false
    });
  }

  renderNiftyChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    const ctx = document.getElementById('niftyChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock data for Nifty trend
    const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const data = labels.map((_, i) => 22000 + Math.sin(i * 0.5) * 500 + i * 20);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'NIFTY 50 (30 Days Trend)',
          data: data,
          borderColor: '#10b981', // emerald-500
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: true }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.chart) this.chart.destroy();
  }

  goToPrediction(symbol: string) {
    // Attempt to quickly navigate and pre-fill the prediction for the given index
    // We'll navigate to stock-prediction and can pass symbol via state or query params if configured.
    // For now, standard navigation.
    this.router.navigate(['/stock-prediction']);
  }
}

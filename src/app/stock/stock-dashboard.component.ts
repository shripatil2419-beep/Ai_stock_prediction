import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subscription, interval, switchMap, startWith } from 'rxjs';
import Chart from 'chart.js/auto';
import { StockService } from '../stock.service';
import { StockPoint, AIInsights, LiveQuote, StockPick, NewsItem, IndianMarketDataResponse } from '../stock.types';
import { AuthService } from '../auth.service';
import { WatchlistService } from '../watchlist.service';
import { PortfolioService } from '../portfolio.service';
import { WalletService } from '../wallet/wallet.service';
import { NotificationService } from '../notification.service';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

@Component({
  selector: 'app-stock-dashboard',
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.scss']
})
export class StockDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  symbol = 'AAPL';
  days = 60;
  maWindow = 10;
  chartView: 'line' | 'candle' = 'line';
  
  @ViewChild('candleChartContainer') candleChartContainer!: ElementRef;
  private candleChart: IChartApi | null = null;
  private candleSeries: any = null;

  loading = false;
  error: string | null = null;

  history: StockPoint[] = [];
  predictedNextClose: number | null = null;
  insights?: AIInsights;
  liveQuote?: LiveQuote;
  topPicks: StockPick[] = [];
  marketNews: NewsItem[] = [];
  indianMarketData?: IndianMarketDataResponse;
  portfolioSummary: any = null;

  // Investment Calculator
  investAmount = 1000;
  
  // Search suggestions
  searchResults: any[] = [];
  showSuggestions = false;

  // AI Summary
  aiSummary: string | null = null;
  summaryLoading = false;

  // Watchlist
  watchlist: string[] = [];

  get predictedReturn(): number {
    if (!this.predictedNextClose || this.history.length === 0) return 0;
    const currentPrice = this.liveQuote?.price || this.history[this.history.length - 1].close;
    const shares = this.investAmount / currentPrice;
    const futureValue = shares * this.predictedNextClose;
    return futureValue - this.investAmount;
  }

  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private liveSub?: Subscription;

  // News Modal State
  selectedArticle: any = null;
  isArticleLoading: boolean = false;

  // Buy Modal state
  isInvesting = false;
  buyInvestAmount = 1000;
  buyQuantity = 0;

  constructor(
    public stock: StockService,
    public router: Router,
    public auth: AuthService,
    public watchlistService: WatchlistService,
    public portfolioService: PortfolioService,
    public walletService: WalletService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    this.watchlistService.watchlist$.subscribe(list => this.watchlist = list);
    // Refresh top picks and news
    this.stock.getTopPicks().subscribe(res => { if (res && res.picks) this.topPicks = res.picks; });
    this.stock.getMarketNews().subscribe(res => { if (res && res.news) this.marketNews = res.news; });
    this.fetchIndianMarketData();
    // Refresh Indian Pulse every 15 seconds for live feel
    interval(15000).subscribe(() => this.fetchIndianMarketData());
    
    // Subscribe to portfolio summary
    this.portfolioService.summary$.subscribe(s => this.portfolioSummary = s);
    this.portfolioService.refreshPortfolio();
    this.walletService.refreshWallet();
  }

  loadWatchlist() {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      this.watchlist = JSON.parse(saved);
    } else {
      this.watchlist = ['AAPL', 'MSFT', 'TSLA'];
      this.saveWatchlist();
    }
  }

  saveWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
  }

  toggleWatchlist(s: string) {
    if (!s) return;
    this.watchlistService.toggleWatchlist(s).subscribe();
  }

  isInWatchlist(s: string): boolean {
    return this.watchlistService.isInWatchlist(s);
  }

  selectSymbols(s: string) {
    this.symbol = s;
    this.onPredict();
  }

  quickInvest(): void {
    const lastPrice = this.history[this.history.length - 1].close;
    const qty = Math.floor(1000 / lastPrice) || 1; // Basic logic: Invest ~1000
    const cost = qty * lastPrice;

    if (this.walletService.getBalance() < cost) {
      this.notificationService.addNotification({
        type: 'system',
        title: 'Insufficient Funds',
        message: 'Please add funds to your wallet to complete this purchase.',
        priority: 'high'
      });
      return;
    }

    this.isInvesting = true;
    this.portfolioService.buyStock(this.symbol, qty, lastPrice).subscribe({
      next: () => {
        this.walletService.spendFunds(cost, `Purchase: ${qty} x ${this.symbol}`);
        this.isInvesting = false;
        this.notificationService.addNotification({
          type: 'security',
          title: 'Purchase Success',
          message: `Successfully added ${qty} shares of ${this.symbol} to your portfolio.`,
          priority: 'medium'
        });
      },
      error: () => this.isInvesting = false
    });
  }

  updateBuyQuantity(): void {
    const lastPrice = this.liveQuote?.price || (this.history.length > 0 ? this.history[this.history.length - 1].close : 0);
    if (lastPrice > 0) {
      this.buyQuantity = Math.floor(this.buyInvestAmount / lastPrice);
    } else {
      this.buyQuantity = 0;
    }
  }

  confirmPurchase(): void {
    const lastPrice = this.liveQuote?.price || (this.history.length > 0 ? this.history[this.history.length - 1].close : 0);
    const qty = this.buyQuantity;
    const cost = qty * lastPrice;

    if (qty <= 0) return;

    if (this.walletService.getBalance() < cost) {
      this.notificationService.addNotification({
        type: 'system',
        title: 'Insufficient Funds',
        message: 'Please add funds to your wallet to complete this purchase.',
        priority: 'high'
      });
      return;
    }

    this.isInvesting = true;
    this.portfolioService.buyStock(this.symbol, qty, lastPrice).subscribe({
      next: () => {
        this.walletService.spendFunds(cost, `Purchase: ${qty} x ${this.symbol}`);
        this.isInvesting = false;
        this.notificationService.addNotification({
          type: 'security',
          title: 'Purchase Success',
          message: `Successfully added ${qty} shares of ${this.symbol} to your portfolio.`,
          priority: 'medium'
        });
        
        // Use Bootstrap 5 modal API to close
        const modalEl = document.getElementById('buyStockModal');
        if (modalEl) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            // Fallback if instance not initialized (manual close button still works)
            const bsModal = new (window as any).bootstrap.Modal(modalEl);
            bsModal.hide();
          }
        }
      },
      error: () => this.isInvesting = false
    });
  }

  openNews(newsId: number) {
    this.isArticleLoading = true;
    this.selectedArticle = null;
    
    // Programmatically open the Bootstrap modal
    const modalElement = document.getElementById('newsArticleModal');
    if (modalElement) {
      const bsModal = new (window as any).bootstrap.Modal(modalElement);
      bsModal.show();
    }

    this.stock.getNewsArticle(newsId).subscribe({
      next: (res) => {
        if (res.ok) {
          this.selectedArticle = res.article;
        }
        this.isArticleLoading = false;
      },
      error: () => {
        this.isArticleLoading = false;
      }
    });
  }

  // Helper method to format fullContent into paragraphs
  formatArticleContent(content: string): string[] {
    if (!content) return [];
    return content.split('\n\n');
  }

  onSearchChange() {
    const q = this.symbol.trim();
    if (q.length < 1) {
      this.searchResults = [];
      this.showSuggestions = false;
      return;
    }
    this.stock.searchStocks(q).subscribe({
      next: (res) => {
        if (res.ok) {
          this.searchResults = res.results;
          this.showSuggestions = this.searchResults.length > 0;
        }
      }
    });
  }

  selectSuggestion(s: any) {
    this.symbol = s.symbol;
    this.showSuggestions = false;
    this.onPredict();
  }

  askAISummary() {
    if (!this.symbol) return;
    this.summaryLoading = true;
    this.aiSummary = null;
    this.stock.getAISummary(this.symbol).subscribe({
      next: (res) => {
        this.summaryLoading = false;
        if (res.ok) {
          this.aiSummary = res.summary;
        }
      },
      error: () => {
        this.summaryLoading = false;
      }
    });
  }

  fetchTopPicks() {
    this.stock.getTopPicks().subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.topPicks = resp.picks;
        }
      },
      error: (err) => console.warn('Failed to fetch top picks', err)
    });
  }

  fetchMarketNews() {
    this.stock.getMarketNews().subscribe({
      next: (resp) => {
        if (resp.ok) {
          this.marketNews = resp.news;
        }
      },
      error: (err) => console.warn('Failed to fetch news', err)
    });
  }

  selectSymbol(s: string) {
    this.symbol = s;
    this.onPredict();
  }

  fetchIndianMarketData() {
    this.stock.getIndianMarketData().subscribe({
      next: (res) => {
        if (res.ok) {
          this.indianMarketData = res;
        }
      },
      error: (err) => console.warn('Failed to fetch Indian market data', err)
    });
  }

  ngOnDestroy() {
    this.stopLiveUpdates();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCandleChart();
      this.onPredict();
    }, 500);
  }

  initCandleChart() {
    if (!this.candleChartContainer) return;
    
    this.candleChart = createChart(this.candleChartContainer.nativeElement, {
      width: this.candleChartContainer.nativeElement.offsetWidth,
      height: 400,
      layout: {
        background: { color: 'rgba(0,0,0,0)' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)' },
        horzLines: { color: 'rgba(255,255,255,0.05)' },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.1)',
      },
    });

    this.candleSeries = (this.candleChart as any).addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    window.addEventListener('resize', () => {
      if (this.candleChart && this.candleChartContainer) {
        this.candleChart.applyOptions({ width: this.candleChartContainer.nativeElement.offsetWidth });
      }
    });
  }

  renderCandlestickChart() {
    if (!this.candleSeries || !this.history.length) return;
    
    const candleData = this.history.map(h => ({
      time: h.time,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close
    }));

    this.candleSeries.setData(candleData);
    this.candleChart?.timeScale().fitContent();
  }

  setChartView(view: 'line' | 'candle') {
    this.chartView = view;
    if (view === 'candle') {
      setTimeout(() => {
        if (this.candleChart && this.candleChartContainer) {
          this.candleChart.applyOptions({ width: this.candleChartContainer.nativeElement.offsetWidth });
          this.renderCandlestickChart();
        }
      }, 100);
    }
  }

  onPredict(): void {
    const symbol = (this.symbol || '').trim().toUpperCase();
    if (!symbol) return;

    this.loading = true;
    this.error = null;
    this.stopLiveUpdates();

    this.stock
      .predict(symbol, this.days, this.maWindow)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp) => {
          if (!resp.ok) {
            this.error = resp.error;
            this.history = [];
            this.predictedNextClose = null;
            this.insights = undefined;
            this.renderChart();
            return;
          }
          this.history = resp.history ?? [];
          this.predictedNextClose = resp.predictedNextClose ?? null;
          this.insights = resp.insights;
          this.renderChart();
          this.renderCandlestickChart();
          this.startLiveUpdates(symbol);
        },
        error: (e) => {
          this.error = e?.message ?? 'Request failed';
          this.history = [];
          this.predictedNextClose = null;
          this.insights = undefined;
          this.renderChart();
        }
      });
  }

  private startLiveUpdates(symbol: string) {
    this.liveSub = interval(5000) // Poll every 5 seconds for truly live experience
      .pipe(
        startWith(0),
        switchMap(() => this.stock.getLiveQuote(symbol))
      )
      .subscribe({
        next: (quote) => {
          if (quote.ok) {
            // Check if price actually changed to trigger animation
            const hasChanged = this.liveQuote && this.liveQuote.price !== quote.price;
            this.liveQuote = quote;
            
            if (hasChanged) {
              this.triggerValueFlash();
            }
          }
        },
        error: (err) => console.warn('Live update failed:', err)
      });
  }

  private triggerValueFlash() {
    const el = document.querySelector('.live-price-value');
    if (el) {
      el.classList.remove('value-update-flash');
      void (el as HTMLElement).offsetWidth; // trigger reflow
      el.classList.add('value-update-flash');
    }
  }

  private stopLiveUpdates() {
    if (this.liveSub) {
      this.liveSub.unsubscribe();
      this.liveSub = undefined;
    }
    this.liveQuote = undefined;
  }

  private renderChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) return;

    const labels = this.history.map((p) => p.time);
    const closes = this.history.map((p) => p.close);
    const predicted = this.predictedNextClose;

    const nextLabel = predicted !== null ? 'NEXT' : null;
    const allLabels = nextLabel ? [...labels, nextLabel] : labels;

    const series = nextLabel ? [...closes, predicted as number] : closes;
    const pointRadius = series.map((_, idx) => (idx === series.length - 1 && nextLabel ? 4 : 2));
    const pointBg = series.map((_, idx) => (idx === series.length - 1 && nextLabel ? '#22c55e' : '#60a5fa'));

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Close Price',
            data: series,
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.2)',
            tension: 0.25,
            pointRadius,
            pointBackgroundColor: pointBg
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#e5e7eb' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#9ca3af', maxTicksLimit: 10 }
          },
          y: {
            ticks: { color: '#9ca3af' }
          }
        }
      }
    });
  }
}


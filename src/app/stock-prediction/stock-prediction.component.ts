import { Component } from '@angular/core';
import Chart from 'chart.js/auto';
import { StockService } from '../stock.service';
import { AIInsights, StockPoint } from '../stock.types';

@Component({
  selector: 'app-stock-prediction',
  templateUrl: './stock-prediction.component.html',
  styleUrls: ['./stock-prediction.component.scss']
})
export class StockPredictionComponent {
  stockSymbol = '';
  horizon = 7; // Default 7 days
  history: StockPoint[] = [];
  predictedNextClose: number | null = null;
  insights?: AIInsights;
  errorMessage = '';
  loading = false;
  chart: Chart | null = null;

  // Analysis simulation states
  analysisStep = 0;
  analysisSteps = [
    'Scanning historical price action...',
    'Calculating technical volatility...',
    'Feeding data to LSTM neural network...',
    'Generating predictive probability...',
    'Finalizing forecast results...'
  ];

  constructor(private stock: StockService) {}

  predictStock() {
    if (!this.stockSymbol) {
      this.errorMessage = 'Please enter a stock symbol.';
      this.history = [];
      return;
    }
    this.errorMessage = '';
    this.loading = true;
    this.analysisStep = 0;
    this.history = [];
    this.insights = undefined;

    // Simulate multi-step analysis
    const stepInterval = setInterval(() => {
      if (this.analysisStep < this.analysisSteps.length - 1) {
        this.analysisStep++;
      }
    }, 800);

    this.stock.predict(this.stockSymbol, this.horizon, 3).subscribe({
      next: (res) => {
        clearInterval(stepInterval);
        this.analysisStep = this.analysisSteps.length - 1;
        
        // Brief delay for the final step to be visible
        setTimeout(() => {
          this.loading = false;
          if (res.ok && res.history) {
            this.history = res.history;
            this.predictedNextClose = res.predictedNextClose;
            this.insights = res.insights;
            setTimeout(() => this.renderChart(), 0);
          } else if (!res.ok) {
            this.errorMessage = res.error || 'Prediction failed.';
          }
        }, 500);
      },
      error: (err) => {
        clearInterval(stepInterval);
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Prediction failed.';
      }
    });
  }

  setHorizon(val: number) {
    this.horizon = val;
    if (this.history.length > 0) {
      this.predictStock();
    }
  }

  renderChart() {
    if (!this.history || this.history.length === 0) return;
    const ctx = document.getElementById('predictionChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = this.history.map(p => p.time);
    const data = this.history.map(p => p.close);

    const gradient = ctx.getContext('2d')?.createLinearGradient(0, 0, 0, 400);
    if (gradient) {
      gradient.addColorStop(0, 'rgba(13, 110, 253, 0.4)');
      gradient.addColorStop(1, 'rgba(13, 110, 253, 0)');
    }

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${this.stockSymbol.toUpperCase()} Prediction`,
          data: data,
          borderColor: '#0d6efd',
          borderWidth: 3,
          backgroundColor: gradient || 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0d6efd',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }
}


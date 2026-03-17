import { Component, OnInit } from '@angular/core';
import { NewsService, NewsItem } from '../news.service';

@Component({
  selector: 'app-news-hub',
  templateUrl: './news-hub.component.html',
  styleUrls: ['./news-hub.component.scss']
})
export class NewsHubComponent implements OnInit {
  news: NewsItem[] = [];
  isLoading = true;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.fetchNews();
  }

  fetchNews(): void {
    this.isLoading = true;
    this.newsService.getMarketNews().subscribe({
      next: (res) => {
        this.news = res.news;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'Bullish': return 'text-success bg-success-subtle';
      case 'Bearish': return 'text-danger bg-danger-subtle';
      default: return 'text-warning bg-warning-subtle';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'Bullish': return 'bi-arrow-up-right-circle-fill';
      case 'Bearish': return 'bi-arrow-down-right-circle-fill';
      default: return 'bi-dash-circle-fill';
    }
  }
}

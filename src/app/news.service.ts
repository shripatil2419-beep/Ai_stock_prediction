import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  summary: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number;
  timestamp: string;
  source: string;
  aiInsight: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  getMarketNews(): Observable<{ ok: boolean; news: NewsItem[] }> {
    return this.http.get<{ ok: boolean; news: NewsItem[] }>(this.apiUrl);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PredictResponse, StockHistoryResponse, LiveQuote, TopPicksResponse, NewsResponse, IndianMarketDataResponse, GlobalExtendedResponse } from './stock.types';

@Injectable({ providedIn: 'root' })
export class StockService {
  private apiUrl = '/api';
  constructor(private http: HttpClient) {}

  history(symbol: string, days: number): Observable<StockHistoryResponse> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<StockHistoryResponse>(`/api/stock/${encodeURIComponent(symbol)}/history`, { params });
  }

  predict(symbol: string, days: number, maWindow: number): Observable<PredictResponse> {
    return this.http.post<PredictResponse>('/api/predict', { symbol, days, maWindow });
  }

  getLiveQuote(symbol: string): Observable<LiveQuote> {
    const headers = { 'X-Skip-Loader': 'true' };
    return this.http.get<LiveQuote>(`/api/stock/${encodeURIComponent(symbol)}/quote`, { headers });
  }

  getTopPicks(): Observable<TopPicksResponse> {
    return this.http.get<TopPicksResponse>('/api/market/top-picks');
  }

  getMarketNews(): Observable<NewsResponse> {
    return this.http.get<NewsResponse>('/api/market/news');
  }

  getNewsArticle(id: number): Observable<any> {
    return this.http.get<any>(`/api/market/news/${id}`);
  }

  searchStocks(query: string): Observable<any> {
    return this.http.get<any>(`/api/stock/search?q=${encodeURIComponent(query)}`);
  }

  getAISummary(symbol: string): Observable<any> {
    return this.http.get<any>(`/api/stock/${encodeURIComponent(symbol)}/summary`);
  }

  getGlobalExtended(): Observable<GlobalExtendedResponse> {
    const headers = { 'X-Skip-Loader': 'true' };
    return this.http.get<GlobalExtendedResponse>(`${this.apiUrl}/market/global-extended`, { headers });
  }

  getIndianMarketData(): Observable<IndianMarketDataResponse> {
    const headers = { 'X-Skip-Loader': 'true' };
    return this.http.get<IndianMarketDataResponse>('/api/market/indian-pulse', { headers });
  }
}

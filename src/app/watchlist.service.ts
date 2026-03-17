import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private watchlistSubject = new BehaviorSubject<string[]>([]);
  watchlist$ = this.watchlistSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshWatchlist();
  }

  private getHeaders() {
    const email = localStorage.getItem('userEmail') || '';
    return { 'x-user-email': email };
  }

  refreshWatchlist() {
    this.http.get<{ok: boolean, watchlist: string[]}>('/api/watchlist', { headers: this.getHeaders() }).subscribe(res => {
      if (res.ok) this.watchlistSubject.next(res.watchlist);
    });
  }

  toggleWatchlist(symbol: string): Observable<any> {
    return this.http.post<any>('/api/watchlist/toggle', { symbol }, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.ok) this.watchlistSubject.next(res.watchlist);
      })
    );
  }

  isInWatchlist(symbol: string): boolean {
    return this.watchlistSubject.value.includes(symbol.toUpperCase());
  }
}

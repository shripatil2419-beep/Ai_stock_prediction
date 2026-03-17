import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WatchlistService } from '../watchlist.service';
import { environment } from '../../environments/environment';

interface Strategy {
  type: string;
  title: string;
  description: string;
  action: string;
  risk: string;
  expectedReturn: string;
}

@Component({
  selector: 'app-ai-advisor',
  templateUrl: './ai-advisor.component.html',
  styleUrls: ['./ai-advisor.component.scss']
})
export class AIAdvisorComponent implements OnInit {
  isOpen = false;
  strategy: Strategy | null = null;
  portfolioHealth = 0;
  isLoading = false;
  watchlist: string[] = [];

  constructor(private http: HttpClient, private watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.fetchStrategy();
    this.watchlistService.watchlist$.subscribe(list => this.watchlist = list);
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.fetchStrategy();
  }

  fetchStrategy(): void {
    this.isLoading = true;
    this.http.get<{ok: boolean, strategy: Strategy, portfolioHealth: number}>(`${environment.apiUrl}/advisor/strategy`).subscribe({
      next: (res) => {
        this.strategy = res.strategy;
        this.portfolioHealth = res.portfolioHealth;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getHealthColor(): string {
    if (this.portfolioHealth > 80) return '#198754'; // success
    if (this.portfolioHealth > 50) return '#ffc107'; // warning
    return '#dc3545'; // danger
  }
}

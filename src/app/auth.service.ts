import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>('/api/login', credentials).pipe(
      tap(res => {
        if (res.ok) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', res.email);
          // Set profile data from response
          const profile = {
            name: res.email.split('@')[0],
            email: res.email,
            phoneNumber: res.phoneNumber,
            accountNumber: res.accountNumber,
            avatar: 'https://ui-avatars.com/api/?name=' + res.email + '&background=random',
            memberSince: 'March 2026'
          };
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>('/api/register', userData);
  }

  getUserProfile() {
    const profile = localStorage.getItem('userProfile');
    if (profile) return JSON.parse(profile);
    
    // If logged in but profile is missing (e.g., page refresh)
    if (this.isLoggedIn()) {
      const email = localStorage.getItem('userEmail') || 'User@example.com';
      const fallbackProfile = {
        name: email.split('@')[0],
        email: email,
        avatar: 'https://ui-avatars.com/api/?name=' + email + '&background=0d6efd&color=fff',
        memberSince: 'March 2026'
      };
      localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
      return fallbackProfile;
    }
    return null;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userProfile');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}

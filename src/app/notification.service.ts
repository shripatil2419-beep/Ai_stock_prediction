import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Notification {
  id: number;
  type: 'security' | 'market' | 'wallet' | 'system';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
  isSMS?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();

  constructor(private http: HttpClient) {
    // Initial welcome notifications
    this.addNotification({
      type: 'system',
      title: 'Welcome to Antigravity',
      message: 'Your AI-powered trading platform is ready. Explore live markets now!',
      priority: 'low'
    });
  }

  getNotifications(): Notification[] {
    return this.notifications.getValue();
  }

  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>) {
    const current = this.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: Date.now(),
      time: new Date(),
      read: false
    };
    this.notifications.next([newNotif, ...current]);
  }

  markAsRead(id: number) {
    const current = this.getNotifications();
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifications.next(updated);
  }

  markAllAsRead() {
    const current = this.getNotifications();
    const updated = current.map(n => ({ ...n, read: true }));
    this.notifications.next(updated);
  }

  clearAll() {
    this.notifications.next([]);
  }

  removeNotification(id: number) {
    const current = this.getNotifications();
    const updated = current.filter(n => n.id !== id);
    this.notifications.next(updated);
  }

  sendSMSRequest(phoneNumber: string, message: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/sms/send`, { phoneNumber, message });
  }

  getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }
}

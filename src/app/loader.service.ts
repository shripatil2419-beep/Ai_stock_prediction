import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isLoading = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  constructor() {}

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.isLoading.next(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.next(false);
    }
  }

  // Force hide (e.g., when route changes forcefully)
  forceHide() {
    this.requestCount = 0;
    this.isLoading.next(false);
  }
}

import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'AI Stock Advisor';
  
  constructor(
    public router: Router, 
    public auth: AuthService,
    private loaderService: LoaderService,
    public notificationService: NotificationService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      } else if (
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      ) {
        // Delay slightly for smoother feel
        setTimeout(() => {
          this.loaderService.forceHide();
        }, 400);
      }
    });
  }
  
  get hideNavbar(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  get userProfile() {
    return this.auth.getUserProfile();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

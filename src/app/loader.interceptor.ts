import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize, catchError, delay } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const skipLoader = request.headers.has('X-Skip-Loader');
    
    if (!skipLoader) {
      this.loaderService.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!skipLoader) {
          this.loaderService.hide();
        }
      })
    );
  }
}

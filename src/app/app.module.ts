import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { StockPredictionComponent } from './stock-prediction/stock-prediction.component';
import { IndianMarketInsightsComponent } from './market-insights/indian-market-insights.component';
import { WalletComponent } from './wallet/wallet.component';
import { UserProfileComponent } from './profile/user-profile.component';
import { LoaderComponent } from './loader/loader.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderInterceptor } from './loader.interceptor';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GlobalMarketsComponent } from './global-markets/global-markets.component';
import { NewsHubComponent } from './news/news-hub.component';
import { AIAdvisorComponent } from './advisor/ai-advisor.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    StockPredictionComponent,
    IndianMarketInsightsComponent,
    WalletComponent,
    UserProfileComponent,
    LoaderComponent,
    GlobalMarketsComponent,
    NewsHubComponent,
    AIAdvisorComponent,
    PortfolioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ProgressSpinnerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

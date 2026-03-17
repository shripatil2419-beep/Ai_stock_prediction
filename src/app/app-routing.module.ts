import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { StockPredictionComponent } from './stock-prediction/stock-prediction.component';
import { IndianMarketInsightsComponent } from './market-insights/indian-market-insights.component';
import { WalletComponent } from './wallet/wallet.component';
import { UserProfileComponent } from './profile/user-profile.component';
import { GlobalMarketsComponent } from './global-markets/global-markets.component';
import { NewsHubComponent } from './news/news-hub.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./stock/stock.module').then((m) => m.StockModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then((m) => m.AboutModule)
  },
  {
    path: 'stock-prediction',
    component: StockPredictionComponent
  },
  {
    path: 'market-insights',
    component: IndianMarketInsightsComponent
  },
  {
    path: 'wallet',
    component: WalletComponent
  },
  {
    path: 'profile',
    component: UserProfileComponent
  },
  {
    path: 'global-markets',
    component: GlobalMarketsComponent
  },
  {
    path: 'news',
    component: NewsHubComponent
  },
  {
    path: 'portfolio',
    component: PortfolioComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

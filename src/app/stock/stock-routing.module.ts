import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockDashboardComponent } from './stock-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: StockDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule {}


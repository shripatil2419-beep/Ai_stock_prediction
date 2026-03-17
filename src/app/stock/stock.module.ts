import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StockRoutingModule } from './stock-routing.module';
import { StockDashboardComponent } from './stock-dashboard.component';

@NgModule({
  declarations: [StockDashboardComponent],
  imports: [CommonModule, FormsModule, StockRoutingModule]
})
export class StockModule {}


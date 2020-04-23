import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { NgxEchartsModule } from 'ngx-echarts';

import { RubberProductChartPage } from './rubber-product-chart.page';

const routes: Routes = [
  {
    path: '',
    component: RubberProductChartPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgxEchartsModule
  ],
  declarations: [RubberProductChartPage]
})
export class RubberProductChartPageModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SqliteManualPage } from './sqlite-manual.page';

const routes: Routes = [
  {
    path: '',
    component: SqliteManualPage
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./detail/detail.module').then( m => m.DetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SqliteManualPageRoutingModule {}

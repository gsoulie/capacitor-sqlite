import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SqliteManualPageRoutingModule } from './sqlite-manual-routing.module';

import { SqliteManualPage } from './sqlite-manual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SqliteManualPageRoutingModule
  ],
  declarations: [SqliteManualPage]
})
export class SqliteManualPageModule {}

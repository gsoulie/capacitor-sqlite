import { SQLiteService } from './shared/core/services/sqlite/sqlite.service';
import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private initPlugin: boolean;

  constructor(
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private sqlite: SQLiteService
  ) {
    this.platform.ready().then(async () => {
      this.initSQLiteCommunity();
    });
  }

  initSQLiteCommunity() {
    StatusBar.setStyle({ style: Style.Light });
    SplashScreen.hide();
    this.sqlite.initializePlugin().then(ret => {
      this.initPlugin = ret;
      console.log('>>>> in App  this.initPlugin ' + this.initPlugin);
    });
  }
}

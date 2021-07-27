import { SqlLiteApiService } from './../../shared/services/sqlite-api.service';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit, AfterViewInit {

  user: User = new User();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sqliteApiWithHelper: SqlLiteApiService,
    private loadingCtrl: LoadingController) { }

  async ngOnInit() {}

  async ngAfterViewInit() {
    const loading = await this.loadingCtrl
    .create({
      message: 'Loading user infos...'
    });
    await loading.present();

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    await this.sqliteApiWithHelper.fetchUserById(id)
    .then((res) => {
      this.user = res;
      loading.dismiss();
    })
    .catch((e) => {
      loading.dismiss();
      new Error(`fetchUserById where id=${id} failed`);
    });
  }

  async saveUser(): Promise<void> {
    await this.sqliteApiWithHelper.updateUser(this.user);
    this.router.navigate(['/home']);
  }
}

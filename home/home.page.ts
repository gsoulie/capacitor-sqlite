import { BehaviorSubject } from 'rxjs';
import { UserApiService } from './../shared/services/user-api.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy, OnInit {

  sqlite: any;
  username = '';
  useremail = '';
  userage = null;
  users$: BehaviorSubject<User[]> = new BehaviorSubject([]);

  constructor(private sqliteApiWithHelper: UserApiService) { }

  ngOnInit() {
    this.users$ = this.sqliteApiWithHelper.users$;
  }
  async ngAfterViewInit() {
    this.fetchUsers();
  }

  async ngOnDestroy() { await this.sqliteApiWithHelper.closeConnection(); }

  async intializeFirstData() {
    await this.sqliteApiWithHelper.populateMockData()
    .then(async () => {
      await this.fetchUsers();
    });
  }

  async deleteUser(user: User, event) {
    event.stopPropagation();
    this.sqliteApiWithHelper.deleteUser(user)
    /*.then(() => this.fetchUsers())*/;
  }

  async deleteAllUsers(): Promise<void> {
    await this.sqliteApiWithHelper.deleteAllUsers()/*
    .then(() => this.fetchUsers())*/;
  }

  async addUserWithStatementAndValues(): Promise<void> {
    if (this.username === '' || this.useremail === '') {
      alert('Name and email must be filled');
      return;
    }
    await this.sqliteApiWithHelper.addUserWithStatementAndValues(
      new User(null, this.username, this.useremail, this.userage))
      .then(() => {
        this.username = '';
        this.useremail = '';
        this.userage = null;
        this.fetchUsers();  // obligatoire si on veut connaître l'id du nouveau user
      });
  }

  async refreshData(ev) {
    await this.fetchUsers()
    .then(() => {
      ev.target.complete();
    });
  }

  async fetchUsers() {
    await this.sqliteApiWithHelper.fetchUsers()
    /*.then((res) => this.users = res )*/;
  }
}

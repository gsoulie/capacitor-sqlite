import { TestSqlLiteApiService } from './../shared/services/test-sqlite-api.service';
import { BehaviorSubject } from 'rxjs';
import { SqlLiteApiService } from './../shared/services/sqlite-api.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../shared/models/user.model';

@Component({
  selector: 'app-sqlite-manual',
  templateUrl: './sqlite-manual.page.html',
  styleUrls: ['./sqlite-manual.page.scss'],
})
export class SqliteManualPage implements AfterViewInit, OnDestroy, OnInit {

  sqlite: any;
  username = '';
  useremail = '';
  userage = null;
  users$: BehaviorSubject<User[]> = new BehaviorSubject([]);

  constructor(
    private sqliteApi: SqlLiteApiService,
    private sqliteApiWithHelper: TestSqlLiteApiService) { }

  ngOnInit() {
    this.users$ = this.sqliteApiWithHelper.users$;
  }
  async ngAfterViewInit() {
    /*await this.sqliteApi.initializeDBConnection()
    .then(() => {
      this.fetchUsers();
    });*/
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

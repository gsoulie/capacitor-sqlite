import { BehaviorSubject } from 'rxjs';
import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { SqlLiteApiHelperService, SqlRow } from './sqlite-api-helper.service';
@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  users$: BehaviorSubject<User[]> = new BehaviorSubject([]);
  private tableName = 'users';

  constructor(
    private sqliteApiHelper: SqlLiteApiHelperService) { }

  async populateMockData(): Promise<void> {
    return await this.sqliteApiHelper.populateMockData();
  }

  async fetchUsers(): Promise<User[]> {
    return await this.sqliteApiHelper.fetchFullItems<User>(this.tableName)
    .then((res) => {
      this.users$.next(res);
      return res;
    })
    .catch((err) => {
      console.log('Error ' + err);
      return [];
    });
  }

  async fetchUserById(id): Promise<User> {
    return await this.sqliteApiHelper.fetchItemById<User>(this.tableName, 'id', id)
    .then((res) => res);
  }

  /**
   * IMPORTANT : behaviourSubject cannot be updated here because we don't know
   * the new User Id after database insert.
   * If necessary, call fetch function to update behaviourSubject after user insertion
   *
   * @param user
   * @returns
   */
  async addUserWithStatementAndValues(user: User): Promise<capSQLiteChanges> {

    return this.sqliteApiHelper.insertItemWithStatementAndValues(
      this.tableName,
      [new SqlRow('name', user.name),
      new SqlRow('email', user.email),
      new SqlRow('age', user.age)]
    )
    .then((res) => res)
    .catch((err) => {
      console.log('Error ' + err);
      return Promise.reject(new Error(`addUserWithStatementAndValues failed`));
    });
  }

  async updateUser(user: User): Promise<capSQLiteChanges | void> {

    let statements: SqlRow[] = [];
    for (const [key, value] of Object.entries(user)) {
      statements.push(new SqlRow(key, value));
    }

    return await this.sqliteApiHelper.updateItem({
      table: this.tableName,
      statementsWithValues: statements,
      key: 'id',
      value: user.id
    })
    .then((res) => {
      const us = this.users$.getValue();
      const index = us.findIndex(findUser => findUser.id === user.id);
      if (index >= 0) {
        us[index] = user;
        this.users$.next(us);
      }
    })
    .catch((err) => {
      console.log('Error ' + err);
      return Promise.reject(new Error(`updateUser failed`));
    });
  }

  async deleteUser(user: User): Promise<capSQLiteChanges | void> {
    this.sqliteApiHelper.deleteItemById(this.tableName, 'id', user.id)
    .then((res) => {
      let items = this.users$.getValue();
      items = items.filter(i => i !== user);
      this.users$.next(items);
    })
    .catch((err) => {
      console.log('Error ' + err);
      return Promise.reject(new Error(`deleteUser failed`));
    });
  }

  async deleteAllUsers(): Promise<capSQLiteChanges | void> {
    this.sqliteApiHelper.deleteAllItems(this.tableName)
    .then((res) => res)
    .catch((err) => {
      console.log('Error ' + err);
      return Promise.reject(new Error(`deleteAllUsers failed`));
    });
  }

  async closeConnection(): Promise<void> {
    await this.sqliteApiHelper.closeConnection();
  }
}

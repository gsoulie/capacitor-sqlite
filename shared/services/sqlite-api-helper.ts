import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SQLiteService } from './sqlite/sqlite.service';
import { Injectable } from '@angular/core';
import { createSchema, twoUsers } from '../../core/scripts/no-encryption-utils';
import { dbConfig } from '../../core/config/db-config';


export class SqlRow {
  constructor(
    public statement: string,
    public value: any) {}
}

@Injectable({
  providedIn: 'root'
})
export class SqlLiteApiHelperService {

  private db: SQLiteDBConnection;

  constructor(private sqliteService: SQLiteService) { }

  get dbConnection() { return this.db; }

  async initializeDBConnection(): Promise<void> {

    try {
      // initialize the connection
      this.db = await this.sqliteService
              .createConnection(dbConfig.dbName, dbConfig.encrypted, dbConfig.mode, dbConfig.version);

      // open db testEncryption
      await this.db.open();
      await this.initializeTableFromSchema(createSchema);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async initializeTableFromSchema(schemaStringRef): Promise<void> {
    try {
      // create tables in db
      console.log('$$$ create schema... ');
      let ret: any = await this.db.execute(schemaStringRef);
      console.log('$$$ ret.changes.changes in db ' + ret.changes.changes);

      if (ret.changes.changes < 0) {
        return Promise.reject(new Error('Execute createSchema failed'));
      }

      // create synchronization table
      ret = await this.db.createSyncTable();

      if (ret.changes.changes < 0) {
        return Promise.reject(new Error('Execute createSyncTable failed'));
      }

      // set the synchronization date
      const syncDate = new Date().toISOString();//'2020-11-25T08:30:25.000Z';
      await this.db.setSyncDate(syncDate);

    } catch (err) {
      return Promise.reject(err);
    }
  }

  async populateMockData() {
    // add two users in db
    if (!this.db) { await this.initializeDBConnection(); }
    const ret = await this.db.execute(twoUsers);
    console.log('$$$ ret ' + JSON.stringify(ret));
    console.log('$$$ ret.changes = ' + ret.changes.changes);
  }

  async fetchFullItems<T>(table): Promise<T[]> {
    if (!this.db) { await this.initializeDBConnection(); }
    const ret = await this.db.query(`SELECT * FROM ${table};`);
    console.log('$$$ ret query ' + JSON.stringify(ret));
    console.log('$$$ ret query length ' + ret.values.length);
    return ret.values as T[];
  }

  async fetchItemById<T>(table: string, key: string, value: any): Promise<T> {
    const ret = await this.db.query(`SELECT * FROM ${table} WHERE ${key} = ${value};`);
    console.log('$$$ ret query ' + JSON.stringify(ret));
    console.log('$$$ ret query length ' + ret.values.length);

    if(ret.values.length <= 0) {
      console.log('$$$ ret fetchUserById Error ');
      return Promise.reject(new Error(`fetchItemById where id=${value} failed`));
    }
    return ret.values[0] as T;
  }

  /**
   *
   * @param table
   * @param statement : contains each field
   * @param values : contains each values (must have the same size than statement)
   * @returns
   */
  async insertItemWithStatementAndValues(table: string, statementsWithValues: SqlRow[]): Promise<capSQLiteChanges> {

    if (!this.db) { await this.initializeDBConnection(); }

    let statements = [];
    let values = [];
    statementsWithValues.forEach(elt => {
      statements.push(elt.statement);
      values.push(elt.value);
    });
    const statementSlot = (''.padEnd(statements.length + (statements.length - 1), '?,')); // build statement string separated with '?,'

    // add one user with statement and values
    const sqlcmd = `INSERT INTO ${table} (${statements.join(',')}) VALUES (${statementSlot})`;
    const queryValues: Array<any>  = values;

    return await this.db.run(sqlcmd,queryValues);
  }

  /**
   *
   * @param sqlcmd : full sqlcommand to run
   * @returns
   */
  async genericInsert(sqlcmd: string = ''): Promise<capSQLiteChanges> {
    if (!this.db) { await this.initializeDBConnection(); }
    return await this.db.run(sqlcmd);
  }

  /**
   *
   * @param table
   * @param statement : contains each field
   * @param values : contains each values (must have the same size than statement)
   * @returns
   */
  async updateItem({table, key, value, statementsWithValues}:
    {table: string; key: string; value: any; statementsWithValues: SqlRow[]}): Promise<capSQLiteChanges> {

    if (!this.db) { await this.initializeDBConnection(); }

    let statementWithValues = '';
    statementsWithValues.forEach(elt => {
      statementWithValues += statementWithValues !== '' ? `,${elt.statement} = '${elt.value}'` : `${elt.statement} = '${elt.value}'`;
    });

    const sqlcmd = `UPDATE ${table} SET ${statementWithValues} WHERE ${key} = ${value}`;
    console.log('====================== ' + sqlcmd);

    return await this.db.run(sqlcmd);
  }

  async deleteItemById(table: string, key: string, value: any): Promise<capSQLiteChanges> {
    if (!this.db) { await this.initializeDBConnection(); }
    const sqlcmd = `DELETE FROM ${table} WHERE ${key} = ${value};`;
    return await this.db.run(sqlcmd);
  }

  async deleteAllItems(table: string): Promise<capSQLiteChanges> {
    if (!this.db) { await this.initializeDBConnection(); }
    const sqlcmd = `DELETE FROM ${table}`;
    return await this.db.execute(sqlcmd);
  }

  async closeConnection(): Promise<void> {
    await this.sqliteService.closeConnection(dbConfig.dbName);
  }
}

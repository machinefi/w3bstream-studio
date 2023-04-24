import { IndexDb } from '@/lib/dexie';
import { helper, toast } from '@/lib/helper';
import initSqlJs from 'sql.js';
//https://sql.js.org/#/
//https://sqliteonline.com/
import { Database, Statement } from 'sql.js';
interface sqlTypes {
  int32?: number;
  int64?: number;
  string?: string;
  float32?: number;
  float64?: number;
  bool?: boolean;
  time?: number;
  bytes?: string;
}
interface Column {
  name: string;
  constrains: {
    datatype: string;
    length: number;
    desc: string;
    default?: string;
  };
}
interface Key {
  name: string;
  isUnique: boolean;
  columnNames: string[];
}

export enum CREATDB_TYPE {
  SUCCESS,
  EXIST,
  ERROR
}

export interface TableJSONSchema {
  name: string;
  desc: string;
  cols: Column[];
  keys: Key[];
  withSoftDeletion: boolean;
  withPrimaryKey: boolean;
}

export class SqlDB {
  db: any;
  constructor() {
    initSqlJs({
      locateFile: (file) => `/wasms/${file}`
    }).then((SQL) => {
      console.log('sql.js loaded', SQL);
      // const persistedData = localStorage.getItem('s');
      IndexDb.kvs
        .filter((i) => i.key == 'sqlite')
        .toArray()
        .then((res) => {
          if (res.length > 0) {
            console.log(res);
            this.db = new SQL.Database(helper.base64ToUint8Array(res[0].value));
          } else {
            this.db = new SQL.Database();
          }
        });
    });
  }

  test() {
    try {
      this.db.exec(`INSERT INTO t_log VALUES ('Hello, world!1','test')`);
      this.db.exec(`INSERT INTO t_log VALUES ('Hello, world!2','test2')`);
      this.db.exec(`INSERT INTO t_log VALUES ('Hello, world!3','test3')`);
      this.db.exec(`INSERT INTO t_log VALUES ('Hello, world!4','test4')`);
      this.db.exec(`INSERT INTO t_log VALUES ('Hello, world!5','test5')`);
      const selectSQL = 'SELECT * FROM t_log';
      const stmt: Statement | undefined = this.db.prepare(selectSQL);
      if (stmt) {
        while (stmt.step()) {
          const row = stmt.getAsObject();
          console.log(row);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  getTableInfoByJSONSchema(tableJson: TableJSONSchema): { tableName: string; columnName: string[] } | null {
    let tableName = tableJson.name;
    let columns = tableJson.cols;
    let columnName: string[] = [];
    columns.forEach((col, index) => {
      columnName.push(col.name);
    });
    if (!this.findDBExist(tableJson.name)) {
      columnName = [];
    }
    return { tableName, columnName };
  }

  createTableByJSONSchema(tableJson: TableJSONSchema, forceCreate: boolean = false): CREATDB_TYPE {
    let tableName = tableJson.name;
    let columns = tableJson.cols;
    let keys = tableJson.keys;
    let withSoftDeletion = tableJson.withSoftDeletion;
    let withPrimaryKey = tableJson.withPrimaryKey;
    let columnName: string[] = [];

    let sql = `CREATE TABLE ${tableName} (`;
    columns.forEach((col, index) => {
      columnName.push(col.name);
      let colName = col.name;
      let dataType = col.constrains.datatype.toUpperCase();
      let length = col.constrains.length;
      let colString = `${colName} ${dataType}${length ? `(${length})` : ''}`;
      // Add default value if provided
      if (col.constrains.default !== undefined) {
        let defaultValue = col.constrains.default;
        if (dataType === 'TEXT') {
          defaultValue = `'${defaultValue}'`;
        }
        colString += ` DEFAULT ${defaultValue}`;
      }

      if (index < columns.length - 1) {
        colString += ', ';
      }
      sql += colString;
    });

    // Add primary key
    if (withPrimaryKey) {
      let pkColumns = keys[0].columnNames.join(', ');
      sql += `, PRIMARY KEY (${pkColumns})`;
    }

    // Add unique keys
    keys.forEach((key, index) => {
      if (index > 0) {
        let name = key.name;
        let columnNames = key.columnNames.join(', ');
        sql += `, UNIQUE KEY ${name} (${columnNames})`;
      }
    });

    sql += ');';
    if (this.findDBExist(tableJson.name) && !forceCreate) {
      return CREATDB_TYPE.EXIST;
    }

    if (forceCreate) {
      try {
        this.exec(`DROP TABLE ${tableJson.name}`);
      } catch (error) {
        return CREATDB_TYPE.ERROR;
      }
    }

    try {
      console.log('cret table sql', sql);
      this.exec(sql);
      return CREATDB_TYPE.SUCCESS;
    } catch (e) {
      return CREATDB_TYPE.ERROR;
    }
  }

  exec(sql: string) {
    try {
      const res = this.db.exec(sql);
      this.syncToIndexDB();
      return res;
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }
  }

  parseResult(sqlRes: { columns: string[]; values: any[] }) {
    const result = [];
    const columns = sqlRes[0].columns;
    const values = sqlRes[0].values;
    values.forEach((valueArr) => {
      const obj = {};
      columns.forEach((colName, index) => {
        obj[colName] = valueArr[index];
      });
      result.push(obj);
    });
    return result;
  }

  findDBExist(tableName: string) {
    let sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    let res = this.db.exec(sql);
    return res.length > 0;
  }

  syncToIndexDB() {
    let data = this.db.export();
    let buffer = new Buffer(data);
    let base64 = buffer.toString('base64');
    IndexDb.kvs.put({ key: 'sqlite', value: base64 });
  }

  toSQL(sqlJSON: { statement: string; params: sqlTypes[] }): string {
    let statement = sqlJSON.statement;
    let params = sqlJSON.params;
    for (let i = 0; i < params.length; i++) {
      let values = Object.values(params[i]);
      for (let j = 0; j < values.length; j++) {
        let type = Object.keys(params[i])[j];
        let value = values[j];
        switch (type) {
          case 'string':
            statement = statement.replace('?', "'" + value + "'");
            break;
          case 'time':
            statement = statement.replace('?', "'" + value + "'");
            break;
          default:
            statement = statement.replace('?', value);
            break;
        }
      }
    }
    return statement;
  }
}

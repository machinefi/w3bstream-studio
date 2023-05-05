import { IndexDb } from '@/lib/dexie';
import { eventBus } from '@/lib/event';
import { helper, toast } from '@/lib/helper';
import { hooks } from '@/lib/hooks';
import { rootStore } from '@/store/index';
import { resolve } from 'path';
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
export enum CREATDB_TYPE {
  SUCCESS,
  EXIST,
  ERROR
}

export interface TableJSONSchema {
  schemas: Schema[];
}
export interface Schema {
  schema: string; //public
  tables: Table[];
}
export interface Table {
  name: string;
  desc: string;
  cols: Column[];
  keys: Key[];
}
export interface Column {
  name: string;
  constrains: {
    datatype: string;
    length?: number;
    decimal?: number;
    default?: string;
    null?: boolean;
    autoincrement?: boolean;
    desc?: string;
  };
}
export interface Key {
  name: string;
  isUnique: boolean;
  columnNames: string[];
}

export class SqlDB {
  db: any;
  constructor() {
    try {
      if (this.db) return;
      hooks.waitSQLJSReady().then((db) => (this.db = db));
    } catch (error) {}
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

  getTableInfoByJSONSchema(table: Table): { tableName: string; columnName: string[] } | null {
    const tableName = table.name;
    const columns = table.cols;
    const columnNames: string[] = [];
    columns.forEach((col) => {
      columnNames.push(col.name);
    });
    return { tableName, columnName: columnNames };
  }

  // createTableByJSONSchema(tableJson: TableJSONSchema, forceCreate: boolean = false): CREATDB_TYPE {
  //   let tableName = tableJson.name;
  //   let columns = tableJson.cols;
  //   let keys = tableJson.keys;
  //   let withSoftDeletion = tableJson.withSoftDeletion;
  //   let withPrimaryKey = tableJson.withPrimaryKey;
  //   let columnName: string[] = [];

  //   let sql = `CREATE TABLE ${tableName} (`;
  //   columns.forEach((col, index) => {
  //     columnName.push(col.name);
  //     let colName = col.name;
  //     let dataType = col.constrains.datatype.toUpperCase();
  //     let length = col.constrains.length;
  //     let colString = `${colName} ${dataType}${length ? `(${length})` : ''}`;
  //     // Add default value if provided
  //     if (col.constrains.default !== undefined) {
  //       let defaultValue = col.constrains.default;
  //       if (dataType === 'TEXT') {
  //         defaultValue = `'${defaultValue}'`;
  //       }
  //       colString += ` DEFAULT ${defaultValue}`;
  //     }

  //     if (index < columns.length - 1) {
  //       colString += ', ';
  //     }
  //     sql += colString;
  //   });

  //   // Add primary key
  //   if (withPrimaryKey && keys && keys?.length > 0) {
  //     let pkColumns = keys?.[0]?.columnNames?.join(', ');
  //     sql += `, PRIMARY KEY (${pkColumns})`;
  //   }

  //   // Add unique keys
  //   keys?.forEach((key, index) => {
  //     if (index > 0) {
  //       let name = key.name;
  //       let columnNames = key?.columnNames?.join(', ');
  //       sql += `, UNIQUE KEY ${name} (${columnNames})`;
  //     }
  //   });

  //   sql += ');';
  //   if (this.findDBExist(tableJson.name) && !forceCreate) {
  //     return CREATDB_TYPE.EXIST;
  //   }

  //   if (forceCreate) {
  //     try {
  //       this.exec(`DROP TABLE ${tableJson.name}`);
  //     } catch (error) {
  //       return CREATDB_TYPE.ERROR;
  //     }
  //   }

  //   try {
  //     console.log('cret table sql', sql);
  //     this.exec(sql);
  //     return CREATDB_TYPE.SUCCESS;
  //   } catch (e) {
  //     return CREATDB_TYPE.ERROR;
  //   }
  // }
  async createTableByJSONSchema(tableJson: TableJSONSchema) {
    const schemas = tableJson.schemas;
    let sqlResult = CREATDB_TYPE.ERROR;

    for (const schema of schemas) {
      const tables = schema.tables;
      for (const table of tables) {
        const tableName = table.name;
        const columns = table.cols;
        const keys = table.keys;
        const colNames: string[] = [];
        let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;

        columns.forEach((col, index) => {
          colNames.push(col.name);
          const colName = col.name;
          const dataType = col.constrains.datatype.toUpperCase();
          let colString = `${colName} ${dataType}`;
          if (dataType === 'TEXT' && col.constrains.length) {
            colString += `(${col.constrains.length})`;
          } else if (dataType === 'NUMERIC' && col.constrains.length && col.constrains.decimal) {
            colString += `(${col.constrains.length},${col.constrains.decimal})`;
          }

          // Add default value if provided
          if (col.constrains.default !== undefined) {
            let defaultValue = col.constrains.default;
            if (dataType === 'TEXT') {
              defaultValue = `'${defaultValue}'`;
            }
            colString += ` DEFAULT ${defaultValue}`;
          }

          // Add autoincrement if provided
          if (col.constrains.autoincrement) {
            //f_id INT64 INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL
            colString += ' INTEGER PRIMARY KEY AUTOINCREMENT';
            colString = colString.replace(/(\b|(?<=\s))INT(?:8|16|32|64)?\b/g, '');
          }

          // Add nullability
          if (col.constrains.null === true) {
            colString += ' NULL';
          } else {
            colString += ' NOT NULL';
          }

          if (index < columns.length - 1) {
            colString += ', ';
          }
          sql += colString;
        });

        // Add unique keys
        keys?.forEach((key) => {
          if (key.isUnique) {
            const columnNames = key.columnNames.join(', ');
            sql += `, UNIQUE (${columnNames})`;
          }
        });

        sql += ');';

        if (this.findDBExist(tableName)) {
          sqlResult = CREATDB_TYPE.EXIST;
          await this.conflicateDialog(tableName, sql);
          continue;
        }

        try {
          console.log('create table sql', sql);
          this.exec(sql);
          sqlResult = CREATDB_TYPE.SUCCESS;
          toast.success(`Create Table '${tableName}' Success`);
          eventBus.emit('sql.change');
        } catch (e) {
          sqlResult = CREATDB_TYPE.ERROR;
          toast.error(e.message);
          eventBus.emit('sql.change');
          continue;
        }
      }
    }

    return '';
  }
  conflicateDialog(tableName, sql): Promise<boolean> {
    return new Promise((res, rej) => {
      rootStore?.base.confirm.show({
        title: 'Warning',
        description: `The table '${tableName}' already exists. Do you want to overwrite it?`,
        onOk: async () => {
          this.exec(`DROP TABLE IF EXISTS ${tableName}`);
          this.exec(sql);
          toast.success(`Create Table '${tableName}' Success`);
          eventBus.emit('sql.change');
          res(true);
        },
        onCancel: () => {
          res(false);
        }
      });
    });
  }

  exec(sql: string) {
    try {
      const res = this.db.exec(sql);
      this.syncToIndexDB();
      return res;
    } catch (e) {
      console.log(e);
      toast.error(e.message);
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

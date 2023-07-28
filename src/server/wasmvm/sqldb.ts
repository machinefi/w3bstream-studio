import { IndexDb } from '@/lib/dexie';
import { eventBus } from '@/lib/event';
import toast from 'react-hot-toast';
import { hooks } from '@/lib/hooks';
import { ExportTableType } from '@/postgres-meta/helpers';
//https://sql.js.org/#/
//https://sqliteonline.com/
import { Statement } from 'sql.js';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { makeAutoObservable } from 'mobx';

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
  schemas: ExportTableType[];
}

export class SqlDB {
  db: any;
  tables: { tableName: string; table: JSONSchemaTableState }[] = [];
  constructor() {
    makeAutoObservable(this);
    try {
      if (this.db) return;
      hooks.waitSQLJSReady().then((db) => {
        this.db = db;
        this.getAllTables();
      });
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

  async createTableByJSONSchema(tableJson: TableJSONSchema) {
    const schemas = tableJson.schemas;
    let sqlResult = CREATDB_TYPE.ERROR;
    for (const schema of schemas) {
      const tables = schema.tables;
      for (const table of tables) {
        const tableName = table.tableName;
        const columns = table.columns;
        const uniqueArr = [];
        const colNames: string[] = [];
        let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;

        columns.forEach((col, index) => {
          colNames.push(col.name);
          const colName = col.name;
          const dataType = col.type.toUpperCase();
          let colString = `${colName} ${dataType}`;

          if (col.isUnique) {
            uniqueArr.push(colName);
          }

          // Add default value if provided
          if (col.defaultValue) {
            let defaultValue = col.defaultValue;
            if (dataType === 'TEXT') {
              defaultValue = `'${defaultValue}'`;
            }
            colString += ` DEFAULT ${defaultValue}`;
          }

          // Add autoincrement if provided
          if (col.isPrimaryKey) {
            //f_id INT64 INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL
            colString += ' INTEGER PRIMARY KEY AUTOINCREMENT';
            colString = colString.replace(/(\b|(?<=\s))INT(?:8|16|32|64)?\b/g, '');
          }

          // Add nullability
          if (col.isNullable) {
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
        uniqueArr?.forEach((name) => {
          const columnNames = name.join(', ');
          sql += `, UNIQUE (${columnNames})`;
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
          this.syncToIndexDB();
        } catch (e) {
          sqlResult = CREATDB_TYPE.ERROR;
          toast.error(e.message);
          eventBus.emit('sql.change');
          this.syncToIndexDB();
          continue;
        }
      }
    }

    return sqlResult;
  }

  conflicateDialog(tableName, sql): Promise<boolean> {
    return new Promise((res, rej) => {
      globalThis.store?.base.confirm.show({
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

  deleteTable(tableName: string): Promise<boolean> {
    return new Promise((res, rej) => {
      globalThis.store?.base.confirm.show({
        title: 'Warning',
        description: `Do you want to delete this table?`,
        onOk: async () => {
          this.exec(`DROP TABLE IF EXISTS ${tableName}`);
          toast.success(`Delete Table '${tableName}' Success`);
          eventBus.emit('sql.change');
          this.syncToIndexDB();
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

  getAllTables() {
    const sql = `SELECT name FROM sqlite_master WHERE type='table'`;
    const res = this.db.exec(sql);
    const tables = [];
    res?.[0]?.values?.forEach((value) => {
      const tableName = value[0];
      if (tableName == 'sqlite_sequence') {
        return;
      }
      const columnRes = this.db.exec(`PRAGMA table_info(${tableName})`);
      const columnNames = columnRes[0].values.map((value) => {
        return value[1];
      });
      const columnTypes = columnRes[0].values.map((value) => {
        return value[2];
      });
      const res = this.db.exec(`SELECT * FROM ${tableName}`);
      const dataSource: { [key: string]: any }[] = [];
      if (res.length > 0) {
        res[0].values.forEach((i) => {
          const obj: { [key: string]: any } = {};
          i.forEach((j, index) => {
            obj[columnNames[index]] = j;
          });
          dataSource.push(obj);
        });
      }
      // "INT"	integer
      // "INT8"	integer
      // "INT16"	integer
      // "INT32"	integer
      // "INT64"	bigint
      // "UINT"	integer
      // "UINT8"	integer
      // "UINT16"	integer
      // "UINT32"	integer
      // "UINT64"	bigint
      // "FLOAT32"	real
      // "FLOAT64"	double precision
      // "TEXT"	character varying
      // "BOOL"	boolean
      // "TIMESTAMP"	bigint
      // "DECIMAL"	numeric
      // "NUMERIC"	numeric
      tables.push({
        tableName,
        table: new JSONSchemaTableState<any>({
          dataSource,
          columns: columnNames.map((i, index) => {
            return {
              key: i,
              label: i + `(${columnTypes[index]})`
            };
          })
        })
      });
    });
    this.tables = tables;
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
    this.getAllTables();
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

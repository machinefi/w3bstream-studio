import format, { string } from 'pg-format';

export default class PostgresMetaData {
  query: (sql: string) => Promise<any>;

  constructor(query: (sql: string) => Promise<any>) {
    this.query = query;
  }

  async list({ tableSchema, tableName, limit, offset }: { tableSchema: string; tableName: string; limit?: number; offset?: number }): Promise<any> {
    const sql = `SELECT * FROM ${string(`${tableSchema}.${tableName}`)} LIMIT ${limit} OFFSET ${offset}`;
    return await this.query(sql);
  }

  async count({ tableSchema, tableName }: { tableSchema: string; tableName: string }): Promise<{
    data: {
      count: string;
    }[];
    error: {
      message: string;
    } | null;
  }> {
    const sql = `SELECT COUNT(*) FROM ${string(`${tableSchema}.${tableName}`)}`;
    return await this.query(sql);
  }

  async create({ tableSchema, tableName, data }: { tableSchema: string; tableName: string; data: any }): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (!keys.length) {
      throw new Error('No data provided');
    }
    const sql = format(`INSERT INTO %I.%I (%I) VALUES (%L)`, tableSchema, tableName, keys, values);
    return await this.query(sql);
  }
}

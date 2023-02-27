import { string } from 'pg-format';

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
}

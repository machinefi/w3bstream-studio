import { t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput, TRPCError } from '@trpc/server';
import { PostgresMeta } from '@/postgres-meta/index';
import { DEFAULT_POOL_CONFIG, PG_CONNECTION } from '@/constants/postgres-meta';

export const pgRouter = t.router({
  tables: t.procedure.query(async ({ ctx }) => {
    const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
    const { data, error } = await pgMeta.tables.list({
      includeSystemSchemas: false,
      includeColumns: false,
      excludedSchemas: ['pg_catalog', 'information_schema', 'hdb_catalog']
    });
    await pgMeta.end();
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    return data
      .filter((item) => item.name !== 't_sql_meta_enum')
      .map((item) => {
        return {
          tableId: item.id,
          tableSchema: item.schema,
          tableName: item.name
        };
      });
  }),
  columns: t.procedure
    .input(
      z.object({
        tableId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.columns.list({
        includeSystemSchemas: false,
        tableId: Number(input.tableId)
      });
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  tableData: t.procedure
    .input(
      z.object({
        tableSchema: z.string(),
        tableName: z.string(),
        page: z.number().optional(),
        pageSize: z.number().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const page = input.page || 1;
      const pageSize = input.pageSize || 10;
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.data.list({
        tableSchema: input.tableSchema,
        tableName: input.tableName,
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  tableDataCount: t.procedure
    .input(
      z.object({
        tableSchema: z.string(),
        tableName: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.data.count({
        tableSchema: input.tableSchema,
        tableName: input.tableName
      });
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data[0]?.count || 0;
    })
});

export type PgRouter = typeof pgRouter;
export type TableType = inferProcedureOutput<PgRouter['tables']>[0];

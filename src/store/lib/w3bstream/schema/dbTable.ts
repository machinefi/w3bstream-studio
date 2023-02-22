import { trpc } from '@/lib/trpc';
import { TableNameType } from '@/server/routers/w3bstream';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';

export default class DBTableModule {
  allTableNames = new PromiseState<() => Promise<any>, TableNameType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.tableNames.query();
      if (res) {
        return res;
      }
      return [];
    }
  });

  table = new JSONSchemaTableState({
    pagination: new PaginationState({
      page: 1,
      limit: 10,
    }),
    isServerPaging: true,
    rowKey: 'f_id',
    containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
  });

  get currentTable() {
    return this.allTableNames.current;
  }

  async getCurrentTableCols() {
    const res = await trpc.api.tableCols.query({
      tableName: this.currentTable.tableName
    });
    if (res) {
      return res;
    }
    return [];
  }

  async getCurrentTableDataCount() {
    const res = await trpc.api.tableDataCount.query({
      ...this.currentTable
    });
    if (res) {
      return res;
    }
    return 0;
  }

  async getCurrentTableData() {
    const res = await trpc.api.tableData.query({
      ...this.currentTable,
      page: this.table.pagination.page,
      pageSize: this.table.pagination.limit
    });
    if (res) {
      return res;
    }
    return [];
  }

  async init() {
    if (this.currentTable) {
      this.table.pagination.setData({
        page: 1
      });

      const [cols, count, data] = await Promise.all([this.getCurrentTableCols(), this.getCurrentTableDataCount(), this.getCurrentTableData()]);

      this.table.set({
        columns: cols.map((item) => {
          return {
            key: item.column_name,
            label: item.column_name
          };
        }),
        dataSource: data
      });
      this.table.pagination.setData({
        total: count
      });
    }
  }

  async onPageChange() {
    const data = await this.getCurrentTableData();
    this.table.set({
      dataSource: data
    });
  }
}

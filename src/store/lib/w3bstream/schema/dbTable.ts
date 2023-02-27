import { trpc } from '@/lib/trpc';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';
import { _ } from '@/lib/lodash';
import { makeObservable, observable } from 'mobx';
import { TableType } from '@/server/routers/pg';

export default class DBTableModule {
  allTableNames = new PromiseState<() => Promise<any>, { [x: string]: TableType[] }>({
    function: async () => {
      try {
        const data = await trpc.pg.tables.query();
        return _.groupBy(data, 'tableSchema');
      } catch (error) {
        console.log('error', error.message);
      }
    }
  });

  table = new JSONSchemaTableState({
    pagination: new PaginationState({
      page: 1,
      limit: 10,
      onPageChange: (currentPage) => {
        this.onPageChange();
      }
    }),
    isServerPaging: true,
    rowKey: 'f_id',
    containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
  });

  currentTable = {
    tableId: 0,
    tableSchema: '',
    tableName: ''
  };

  constructor() {
    makeObservable(this, {
      currentTable: observable
    });
  }

  setCurrentTable(v: TableType) {
    this.currentTable = v;
  }

  async getCurrentTableCols() {
    try {
      const cols = await trpc.pg.columns.query({
        tableId: this.currentTable.tableId
      });
      return cols;
    } catch (error) {
      return [];
    }
  }

  async getCurrentTableDataCount() {
    try {
      const count = await trpc.pg.tableDataCount.query({
        ...this.currentTable
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  async getCurrentTableData() {
    try {
      const data = await trpc.pg.tableData.query({
        ...this.currentTable,
        page: this.table.pagination.page,
        pageSize: this.table.pagination.limit
      });
      return data;
    } catch (error) {
      return [];
    }
  }

  async init() {
    if (this.currentTable.tableSchema && this.currentTable.tableName) {
      const [cols, count] = await Promise.all([this.getCurrentTableCols(), this.getCurrentTableDataCount()]);
      this.table.set({
        columns: cols.map((item) => {
          return {
            key: item.name,
            label: item.name
          };
        })
      });
      this.table.pagination.setData({
        page: 1,
        total: Number(count)
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

import { trpc } from '@/lib/trpc';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';
import { _ } from '@/lib/lodash';
import { makeObservable, observable } from 'mobx';

export type TableNameType = { tableSchema: string; tableName: string };

export default class DBTableModule {
  allTableNames = new PromiseState<() => Promise<any>, { [x: string]: TableNameType[] }>({
    function: async () => {
      try {
        const res = await trpc.api.tableNames.query();
        return _.groupBy(
          res.filter((i) => i.tableName !== 't_sql_meta_enum'),
          'tableSchema'
        );
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
    tableSchema: '',
    tableName: ''
  };

  constructor() {
    makeObservable(this, {
      currentTable: observable
    });
  }

  setCurrentTable(v: TableNameType) {
    this.currentTable = v;
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
    if (this.currentTable.tableSchema && this.currentTable.tableName) {
      const [cols, count] = await Promise.all([this.getCurrentTableCols(), this.getCurrentTableDataCount()]);
      this.table.set({
        columns: cols.map((item) => {
          return {
            key: item.column_name,
            label: item.column_name
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

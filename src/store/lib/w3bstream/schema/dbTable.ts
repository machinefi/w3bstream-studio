import { trpc } from '@/lib/trpc';
import { JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';
import { _ } from '@/lib/lodash';
import { makeObservable, observable } from 'mobx';
import { TableType } from '@/server/routers/pg';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { v4 as uuidv4 } from 'uuid';
import { TableColumnsWidget } from '@/components/JSONFormWidgets/TableColumns';

export const createTableSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name'
    },
    comment: {
      type: 'string',
      title: 'Description'
    },
    rls_enabled: {
      type: 'boolean',
      title: 'Enable Row Level Security (RLS)',
      default: true
    },
    columns: {
      type: 'string',
      title: 'Columns'
    }
  },
  required: ['name']
} as const;

type CreateTableSchemaType = FromSchema<typeof createTableSchema>;

export interface WidgetColumn {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isNullable?: boolean;
  isIdentity: boolean;
  isDefineASArray?: boolean;
}

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

  mode: 'EDIT_TABLE' | 'VIEW_DATA' = 'VIEW_DATA';

  createTableForm = new JSONSchemaFormState<CreateTableSchemaType>({
    //@ts-ignore
    schema: createTableSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      rls_enabled: {
        'ui:widget': 'checkbox'
      },
      columns: {
        'ui:widget': TableColumnsWidget
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.createTableForm.reset();
    },
    value: new JSONValue<CreateTableSchemaType>({
      default: {
        name: '',
        description: ''
      }
    })
  });

  widgetColumns: WidgetColumn[] = [];
  onAddWidgetColumn() {
    this.widgetColumns.push({
      id: uuidv4(),
      name: '',
      type: '',
      defaultValue: '',
      isPrimaryKey: false,
      isUnique: false,
      isNullable: false,
      isIdentity: false
    });
  }
  onDeleteWidgetColumn(id: string) {
    this.widgetColumns = this.widgetColumns.filter((i) => i.id !== id);
  }
  onChangeWidgetColumn(data: WidgetColumn) {
    for (let i = 0; i < this.widgetColumns.length; i++) {
      const item = this.widgetColumns[i];
      if (item.id === data.id) {
        Object.assign(item, data);
        break;
      }
    }
  }
  setWidgetColumns(data: WidgetColumn[]) {
    this.widgetColumns = data;
  }
  resetWidgetColumns() {
    this.widgetColumns = [
      {
        id: uuidv4(),
        name: 'id',
        type: 'int8',
        isPrimaryKey: true,
        isUnique: true,
        isIdentity: true
      },
      {
        id: uuidv4(),
        name: 'created_at',
        type: 'timestamptz',
        defaultValue: 'now()',
        isIdentity: false,
        isNullable: false,
        isPrimaryKey: false,
        isUnique: false
      }
    ];
  }

  constructor() {
    makeObservable(this, {
      mode: observable,
      currentTable: observable,
      widgetColumns: observable
    });
  }

  setCurrentTable(v: TableType) {
    this.currentTable = v;
  }

  setMode(v: 'EDIT_TABLE' | 'VIEW_DATA') {
    this.mode = v;
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
      const count = await trpc.pg.dataCount.query(this.currentTable);
      return count;
    } catch (error) {
      return 0;
    }
  }

  async getCurrentTableData() {
    try {
      const data = await trpc.pg.data.query({
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

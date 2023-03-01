import { trpc } from '@/lib/trpc';
import { JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';
import { _ } from '@/lib/lodash';
import { makeObservable, observable } from 'mobx';
import { ColumnType, TableType } from '@/server/routers/pg';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { v4 as uuidv4 } from 'uuid';
import { ColumnItemWidget, TableColumnsWidget } from '@/components/JSONFormWidgets/TableColumns';
import { showNotification } from '@mantine/notifications';

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

export const columnSchema = {
  type: 'object',
  properties: {
    column: {
      type: 'string',
      title: ''
    },
    comment: {
      type: 'string',
      title: 'Description'
    }
  }
} as const;

type CreateTableSchemaType = FromSchema<typeof createTableSchema>;
type ColumnSchemaType = FromSchema<typeof columnSchema>;

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
  comment?: string;
}

export default class DBTableModule {
  allTableNames = new PromiseState<() => Promise<any>, { [x: string]: TableType[] }>({
    function: async () => {
      try {
        const res = await trpc.pg.tables.query();
        const data = _.groupBy(res, 'tableSchema');
        if (!data.public) {
          data.public = [];
        }
        return data;
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
      },
      layout: [['name', 'comment'], 'rls_enabled', 'columns']
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.createTableForm.reset();
    },
    value: new JSONValue<CreateTableSchemaType>({
      default: {
        name: '',
        comment: '',
        rls_enabled: true
      }
    })
  });

  columnForm = new JSONSchemaFormState<ColumnSchemaType>({
    //@ts-ignore
    schema: columnSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      column: {
        'ui:widget': ColumnItemWidget
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.columnForm.reset();
    },
    value: new JSONValue<ColumnSchemaType>({
      default: {
        comment: ''
      }
    })
  });

  mode: 'EDIT_TABLE' | 'VIEW_DATA' = 'VIEW_DATA';

  currentTable = {
    tableId: 0,
    tableSchema: '',
    tableName: ''
  };

  currentColumns: ColumnType[] = [];

  currentWidgetColumn: WidgetColumn = {
    id: '-',
    name: '',
    type: '',
    defaultValue: '',
    isPrimaryKey: false,
    isUnique: false,
    isNullable: true,
    isIdentity: false,
    isDefineASArray: false
  };

  widgetColumns: WidgetColumn[] = [];

  onAddWidgetColumn() {
    this.widgetColumns.push({
      id: uuidv4(),
      name: '',
      type: '',
      defaultValue: '',
      isPrimaryKey: false,
      isUnique: false,
      isNullable: true,
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
        type: 'timestamp',
        defaultValue: 'now()',
        isIdentity: false,
        isNullable: false,
        isPrimaryKey: false,
        isUnique: false
      }
    ];
  }
  async createTable({ tableSchema = 'public', formData }: { tableSchema?: string; formData: CreateTableSchemaType }) {
    let tableId = null;
    try {
      const tableRes = await trpc.pg.createTable.mutate({
        schema: tableSchema,
        name: formData.name,
        comment: formData.comment
      });

      tableId = tableRes.id;

      if (formData.rls_enabled) {
        await trpc.pg.updateTable.mutate({
          id: tableId,
          rls_enabled: formData.rls_enabled
        });
      }

      return tableId;
    } catch (error) {
      await showNotification({ message: error.message });
      return tableId;
    }
  }
  async deleteTable({ tableId, cascade }: { tableId: number; cascade?: boolean }) {
    try {
      await trpc.pg.deleteTable.mutate({
        tableId,
        cascade
      });
      this.allTableNames.call();
    } catch (error) {
      console.log('error', error);
    }
  }
  async addColumn(tableId: number, column: Partial<WidgetColumn>) {
    const { errorMsg } = await trpc.pg.createColumn.mutate({
      tableId,
      ...column
    });
    if (errorMsg) {
      await showNotification({ message: `Failed to create column "${column.name}". Reason: ${errorMsg}` });
    }
    return errorMsg;
  }
  async updateColumn(columnId: string, column: Partial<WidgetColumn>) {
    const { errorMsg } = await trpc.pg.updateColumn.mutate({
      columnId,
      ...column
    });
    if (errorMsg) {
      await showNotification({ message: `Failed to update column "${column.name}". Reason: ${errorMsg}` });
    }
    return errorMsg;
  }
  async deleteColumn({ columnId, cascade }: { columnId: string; cascade?: boolean }) {
    try {
      const { errorMsg } = await trpc.pg.deleteColumn.mutate({
        columnId,
        cascade
      });
      if (errorMsg) {
        await showNotification({ message: errorMsg });
      } else {
        const cols = await this.getCurrentTableCols();
        this.setCurrentColumns(cols);
      }
    } catch (error) {
      console.log('error', error);
    }
  }
  async submitData({ tableSchema = 'public', formData }: { tableSchema?: string; formData: CreateTableSchemaType }) {
    const tableId = await this.createTable({
      tableSchema,
      formData
    });

    if (!tableId) {
      return;
    }

    const columns = formatColumns(this.widgetColumns);

    for (const column of columns) {
      await this.addColumn(tableId, column);
    }

    this.allTableNames.call();
  }

  constructor() {
    makeObservable(this, {
      mode: observable,
      currentTable: observable,
      currentColumns: observable,
      widgetColumns: observable,
      currentWidgetColumn: observable
    });
  }

  setCurrentTable(v: TableType) {
    this.currentTable = v;
  }

  setCurrentColumns(v: ColumnType[]) {
    this.currentColumns = v;
  }

  setCurrentWidgetColumn(v: Partial<WidgetColumn>) {
    this.currentWidgetColumn = Object.assign(this.currentWidgetColumn, v);
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

      this.setCurrentColumns(cols);
    }
  }

  async onPageChange() {
    const data = await this.getCurrentTableData();
    this.table.set({
      dataSource: data
    });
  }
}

export const formatColumn = (column: WidgetColumn) => {
  const { id, ...rest } = column;
  if (column.defaultValue === 'NULL' || column.defaultValue === '') {
    rest.defaultValue = null;
  }
  if (column.defaultValue === 'Empty string') {
    rest.defaultValue = '';
  }
  if (column.defaultValue?.includes('now()') || column.defaultValue?.includes('uuid_generate_v4()')) {
    // @ts-ignore
    rest.defaultValueFormat = 'expression';
  }
  if (column.isDefineASArray) {
    rest.type = `${column.type}[]`;
    delete rest.isDefineASArray;
  } else {
    delete rest.isDefineASArray;
  }
  if (column.type === 'text' || column.type === 'varchar') {
    // @ts-ignore
    rest.comment = '';
  }
  return rest;
};

export const formatColumns = (columns: WidgetColumn[]) => {
  return columns
    .filter((item) => {
      return item.name && item.type;
    })
    .map((item) => {
      return formatColumn(item);
    });
};

export const formatColumnType = (type: string) => {
  switch (type) {
    case 'bigint':
      return 'int8';
    case 'integer':
      return 'int4';
    case 'smallint':
      return 'int2';
    case 'character varying':
      return 'varchar';
    case 'timestamp without time zone':
      return 'timestamp';
    case 'timestamp with time zone':
      return 'timestamptz';
    case 'time without time zone':
      return 'time';
    case 'time with time zone':
      return 'timetz';
    case 'double precision':
      return 'float8';
    case 'real':
      return 'float4';
    case 'boolean':
      return 'bool';
    default:
      return type;
  }
};

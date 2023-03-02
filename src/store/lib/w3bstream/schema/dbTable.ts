import { trpc } from '@/lib/trpc';
import { Column, JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
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
import format from 'pg-format';

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

  mode: 'EDIT_TABLE' | 'VIEW_DATA' | 'QUERY_SQL' = 'VIEW_DATA';

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

  sql = '';

  constructor() {
    makeObservable(this, {
      mode: observable,
      currentTable: observable,
      currentColumns: observable,
      widgetColumns: observable,
      currentWidgetColumn: observable,
      sql: observable
    });
  }

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

  setCurrentTable(v: TableType) {
    this.currentTable = v;
  }

  setCurrentColumns(v: ColumnType[]) {
    this.currentColumns = v;
  }

  setCurrentWidgetColumn(v: Partial<WidgetColumn>) {
    this.currentWidgetColumn = Object.assign(this.currentWidgetColumn, v);
  }

  setMode(v: 'EDIT_TABLE' | 'VIEW_DATA' | 'QUERY_SQL') {
    this.mode = v;
  }

  setSQL(v: string) {
    this.sql = v;
  }

  async querySQL() {
    if (!this.sql) {
      return {
        errorMsg: 'SQL is empty'
      };
    }
    try {
      const { data, errorMsg } = await trpc.pg.query.mutate({
        sql: this.sql
      });
      if (errorMsg) {
        await showNotification({ message: errorMsg });
        return {
          errorMsg
        };
      } else {
        await showNotification({ message: 'This SQL was executed successfully' });
        return data;
      }
    } catch (error) {
      await showNotification({ message: error.message });
      return {
        errorMsg: error.message
      };
    }
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

  async createTableAndColumn({ tableSchema = 'public', formData }: { tableSchema?: string; formData: CreateTableSchemaType }) {
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

  async createTableData(formData: any) {
    const { tableSchema, tableName } = this.currentTable;
    const keys = Object.keys(formData);
    const values = Object.values(formData);
    if (!keys.length) {
      await showNotification({ message: 'No data provided' });
      return 'No data provided';
    }
    const sql = format(`INSERT INTO %I.%I (%I) VALUES (%L)`, tableSchema, tableName, keys, values);
    const { errorMsg } = await trpc.pg.query.mutate({
      sql
    });
    if (errorMsg) {
      await showNotification({ message: errorMsg });
    }
    return errorMsg;
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
    const { tableSchema, tableName } = this.currentTable;
    try {
      const sql = `SELECT COUNT(*) FROM ${format.string(`${tableSchema}.${tableName}`)}`;
      const { data, errorMsg } = await trpc.pg.query.mutate({ sql });
      if (errorMsg) {
        await showNotification({ message: errorMsg });
        return 0;
      } else {
        return data[0].count;
      }
    } catch (error) {
      return 0;
    }
  }

  async getCurrentTableData() {
    const { tableSchema, tableName } = this.currentTable;
    const page = this.table.pagination.page;
    const pageSize = this.table.pagination.limit;
    const offset = (page - 1) * pageSize;
    try {
      const sql = `SELECT * FROM ${format.string(`${tableSchema}.${tableName}`)} LIMIT ${pageSize} OFFSET ${offset}`;
      const { data, errorMsg } = await trpc.pg.query.mutate({
        sql
      });
      if (errorMsg) {
        await showNotification({ message: errorMsg });
        return [];
      } else {
        return data;
      }
    } catch (error) {
      return [];
    }
  }

  async deleteTableData(name, value) {
    if (!name || !value) {
      await showNotification({ message: 'No data provided' });
      return 'No data provided';
    }
    const { tableSchema, tableName } = this.currentTable;
    const sql = format(`DELETE FROM %I.%I WHERE %I = %L`, tableSchema, tableName, name, value);
    const { errorMsg } = await trpc.pg.query.mutate({
      sql
    });
    if (errorMsg) {
      await showNotification({ message: errorMsg });
    }
    return errorMsg;
  }

  async init() {
    if (this.currentTable.tableSchema && this.currentTable.tableName) {
      const [cols, count] = await Promise.all([this.getCurrentTableCols(), this.getCurrentTableDataCount()]);
      const columns: Column[] = cols.map((item) => {
        return {
          key: item.name,
          label: item.name
        };
      });

      const idName = cols[0].name;

      columns.push({
        key: 'action',
        label: 'Action',
        actions: (item) => {
          return [
            {
              props: {
                colorScheme: 'red',
                size: 'xs',
                onClick: async () => {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    onOk: async () => {
                      try {
                        await this.deleteTableData(idName, item[idName]);
                        const data = await this.getCurrentTableData();
                        this.table.set({
                          dataSource: data
                        });
                      } catch (error) {}
                    }
                  });
                }
              },
              text: 'Delete'
            }
          ];
        }
      });

      this.table.set({
        columns
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

export const creatColumnDataForm = (columns: ColumnType[]) => {
  const formatType = (type) => {
    if (type.includes('int')) {
      return 'number';
    }
    return 'string';
  };
  const fieldFormat = (type) => {
    if (type.includes('time')) {
      return 'date-time';
    }
    if (type.includes('date')) {
      return 'date';
    }
    return '';
  };
  const schema = {
    type: 'object',
    properties: {},
    required: []
  };
  const uiSchema = {
    'ui:submitButtonOptions': {
      norender: false,
      submitText: 'Submit'
    }
  };
  columns.forEach((item) => {
    const { name, data_type, comment } = item;
    schema.properties[name] = {
      type: formatType(data_type),
      title: name
    };

    const format = fieldFormat(data_type);
    if (format) {
      schema.properties[name].format = format;
    }

    if (comment) {
      schema.properties[name].description = comment;
    }
    // if (!item.is_nullable) {
    //   schema.required.push(name);
    // }
  });

  // console.log('creatColumnDataForm [columns]', JSON.stringify(columns, null, 2));
  // console.log('creatColumnDataForm [schema]', JSON.stringify(schema, null, 2));

  const form = new JSONSchemaFormState<ColumnSchemaType>({
    //@ts-ignore
    schema,
    uiSchema,
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
    }
  });

  return form;
};

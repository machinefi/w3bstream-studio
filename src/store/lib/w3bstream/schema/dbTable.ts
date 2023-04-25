import { trpc } from '@/lib/trpc';
import { Column, JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { PaginationState } from '@/store/standard/PaginationState';
import { PromiseState } from '@/store/standard/PromiseState';
import { makeObservable, observable } from 'mobx';
import { ColumnType, TableType } from '@/server/routers/pg';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { v4 as uuidv4 } from 'uuid';
import { ColumnItemWidget, TableColumnsWidget } from '@/components/JSONFormWidgets/TableColumns';
import { showNotification } from '@mantine/notifications';
import { DISABLED_SCHEMA_LIST, DISABLED_TABLE_LIST } from '@/constants/postgres-meta';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import EditorWidget from '@/components/JSONFormWidgets/EditorWidget';

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
    // rls_enabled: {
    //   type: 'boolean',
    //   title: 'Enable Row Level Security (RLS)',
    //   default: true
    // },
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
  allTables = new PromiseState<() => Promise<any>, { schemaName: string; tables: TableType[] }[]>({
    defaultValue: [],
    function: async () => {
      const accountRole = globalThis.store.w3s.config.form.formData.accountRole;
      const curProjectName = globalThis.store.w3s.project.curProject?.f_name || '';
      try {
        const schemaName = accountRole === 'DEVELOPER' ? `wasm_project__${curProjectName}` : '';
        const schemas = await trpc.pg.schemas.query({
          accountRole,
          schemaName
        });
        if (schemas?.length) {
          const includedSchemas = schemas.map((s) => s.name);
          const tables = await trpc.pg.tables.query({
            includedSchemas
          });
          const data = includedSchemas.map((schemaName) => {
            const tablesInSchema = tables.filter((t) => t.tableSchema === schemaName);
            return {
              schemaName,
              tables: tablesInSchema
            };
          });
          return data;
        }
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
    containerProps: { mt: 4 }
  });

  createTableForm = new JSONSchemaFormState<CreateTableSchemaType>({
    //@ts-ignore
    schema: createTableSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      // rls_enabled: {
      //   'ui:widget': 'checkbox'
      // },
      columns: {
        'ui:widget': TableColumnsWidget
      },
      layout: [['name', 'comment'], 'columns']
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.createTableForm.reset();
    },
    value: new JSONValue<CreateTableSchemaType>({
      default: {
        name: '',
        comment: ''
        // rls_enabled: true
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
    tableName: '',
    disabled: true
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

    if (globalThis.store.w3s.config.form.formData.accountRole !== 'ADMIN') {
      for (const schema of DISABLED_SCHEMA_LIST) {
        if (this.sql.includes(schema)) {
          return {
            errorMsg: `You don't have permission to access this table`
          };
        }
      }
    }

    // try {
    //   const { data, errorMsg } = await trpc.pg.query.mutate({
    //     sql: this.sql
    //   });
    //   if (errorMsg) {
    //     showNotification({ message: errorMsg });
    //     return {
    //       errorMsg
    //     };
    //   } else {
    //     showNotification({ message: 'This SQL was executed successfully' });
    //     return data;
    //   }
    // } catch (error) {
    //   showNotification({ message: error.message });
    //   return {
    //     errorMsg: error.message
    //   };
    // }
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

      // if (formData.rls_enabled) {
      //   await trpc.pg.updateTable.mutate({
      //     id: tableId,
      //     rls_enabled: formData.rls_enabled
      //   });
      // }

      return tableId;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
      return tableId;
    }
  }

  async deleteTable({ tableId, cascade }: { tableId: number; cascade?: boolean }) {
    try {
      await trpc.pg.deleteTable.mutate({
        tableId,
        cascade
      });
      this.setCurrentTable({
        tableId: 0,
        tableSchema: '',
        tableName: '',
        disabled: true
      });
      this.allTables.call();
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
    }
  }

  async addColumn(tableId: number, column: Partial<WidgetColumn>) {
    try {
      const { errorMsg } = await trpc.pg.createColumn.mutate({
        tableId,
        ...column
      });
      if (errorMsg) {
        showNotification({ message: `Failed to create column "${column.name}". Reason: ${errorMsg}` });
      }
      return errorMsg;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
        return error.message;
      }
    }
  }

  async updateColumn(columnId: string, column: Partial<WidgetColumn>) {
    try {
      const { errorMsg } = await trpc.pg.updateColumn.mutate({
        columnId,
        ...column
      });
      if (errorMsg) {
        showNotification({ message: `Failed to update column "${column.name}". Reason: ${errorMsg}` });
      }
      return errorMsg;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
        return error.message;
      }
    }
  }

  async deleteColumn({ columnId, cascade }: { columnId: string; cascade?: boolean }) {
    try {
      const { errorMsg } = await trpc.pg.deleteColumn.mutate({
        columnId,
        cascade
      });
      if (errorMsg) {
        showNotification({ message: errorMsg });
      } else {
        const cols = await this.getCurrentTableCols();
        this.setCurrentColumns(cols);
      }
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
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

    this.allTables.call();
  }

  async createTableData(keys: string[], values: any[]) {
    const { tableSchema, tableName } = this.currentTable;
    if (!keys.length) {
      showNotification({ message: 'No data provided' });
      return 'No data provided';
    }
    try {
      const { errorMsg } = await trpc.pg.createTableData.mutate({
        tableSchema,
        tableName,
        keys,
        values
      });
      if (errorMsg) {
        showNotification({ message: errorMsg });
      }
      return errorMsg;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
    }
  }

  async getCurrentTableCols() {
    try {
      const cols = await trpc.pg.columns.query({
        tableId: this.currentTable.tableId
      });
      return cols;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
      return [];
    }
  }

  async getCurrentTableDataCount() {
    const { tableSchema, tableName } = this.currentTable;
    try {
      const { data, errorMsg } = await trpc.pg.dataCount.query({ tableSchema, tableName });
      if (errorMsg) {
        showNotification({ message: errorMsg });
        return 0;
      } else {
        return data[0].count;
      }
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
      return 0;
    }
  }

  async getCurrentTableData() {
    const { tableSchema, tableName } = this.currentTable;
    try {
      const { data, errorMsg } = await trpc.pg.tableData.query({
        tableSchema,
        tableName,
        page: this.table.pagination.page,
        pageSize: this.table.pagination.limit
      });
      if (errorMsg) {
        showNotification({ message: errorMsg });
        return [];
      } else {
        return data;
      }
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
      return [];
    }
  }

  async deleteTableData(name, value) {
    if (!name || !value) {
      showNotification({ message: 'No data provided' });
      return 'No data provided';
    }
    const { tableSchema, tableName } = this.currentTable;
    try {
      const { errorMsg } = await trpc.pg.deleteTableData.mutate({
        tableSchema,
        tableName,
        name,
        value
      });
      if (errorMsg) {
        showNotification({ message: errorMsg });
      }
      return errorMsg;
    } catch (error) {
      if (error.message.includes('UNAUTHORIZED')) {
        globalThis.store.w3s.config.logout();
      } else {
        showNotification({ message: error.message });
      }
    }
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

      const idName = cols[0]?.name;
      if (!DISABLED_TABLE_LIST.includes(this.currentTable.tableName) && idName) {
        columns.push({
          key: 'action',
          label: 'Action',
          actions: (item) => {
            return [
              {
                props: {
                  size: 'xs',
                  ...defaultOutlineButtonStyle,
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
      }

      this.table.set({
        columns
      });

      this.table.pagination.setData({
        page: 1,
        total: Number(count)
      });

      if (!this.currentTable.disabled) {
        this.setCurrentColumns(cols);
      }
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

    if (data_type === 'jsonb' || data_type === 'json') {
      schema.properties[name] = {
        ...schema.properties[name],
        default: JSON.stringify({}, null, 2)
      };
      uiSchema[name] = {
        'ui:widget': EditorWidget,
        'ui:options': {
          editorHeight: '400px',
          emptyValue: JSON.stringify({}, null, 2)
        }
      };
    }
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

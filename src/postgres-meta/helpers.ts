import { literal } from 'pg-format';

export const coalesceRowsToArray = (source: string, filter: string) => {
  return `
COALESCE(
  (
    SELECT
      array_agg(row_to_json(${source})) FILTER (WHERE ${filter})
    FROM
      ${source}
  ),
  '{}'
) AS ${source}`;
};

export const filterByList = (include?: string[], exclude?: string[], defaultExclude?: string[]) => {
  if (defaultExclude) {
    exclude = defaultExclude.concat(exclude ?? []);
  }
  if (include?.length) {
    return `IN (${include.map(literal).join(',')})`;
  } else if (exclude?.length) {
    return `NOT IN (${exclude.map(literal).join(',')})`;
  }
  return '';
};

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

export type ExportTableType = {
  schemaName: string;
  tables: {
    tableName: string;
    tableSchema: string;
    comment: string;
    columns: {
      name: string;
      type: string;
      defaultValue: string;
      isIdentity: boolean;
      isNullable: boolean;
      isUnique: boolean;
      isPrimaryKey: boolean;
      comment: string;
    }[];
    relationships: {
      id: number;
      constraint_name: string;
      source_schema: string;
      source_table_name: string;
      source_column_name: string;
      target_table_schema: string;
      target_table_name: string;
      target_column_name: string;
    }[];
  }[];
};

export const formatColumn = (column: WidgetColumn) => {
  const { id, ...rest } = column;
  if (column.defaultValue === 'NULL' || column.defaultValue === '') {
    rest.defaultValue = null;
  }
  if (column.defaultValue === 'Empty string') {
    rest.defaultValue = '';
  }
  if (typeof column.defaultValue === 'string') {
    if (column.defaultValue.includes('now()') || column.defaultValue.includes('uuid_generate_v4()')) {
      // @ts-ignore
      rest.defaultValueFormat = 'expression';
    }
  }
  if (column.isDefineASArray) {
    rest.type = `${column.type}[]`;
    delete rest.isDefineASArray;
  } else {
    delete rest.isDefineASArray;
  }
  if (rest.comment === null) {
    delete rest.comment;
  }
  if (column.type === 'text' || column.type === 'varchar') {
    // @ts-ignore
    rest.comment = '';
  }
  if (rest.isPrimaryKey) {
    delete rest.defaultValue;
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

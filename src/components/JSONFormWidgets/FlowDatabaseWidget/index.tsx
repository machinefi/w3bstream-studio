import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Select } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { TableJSONSchema } from '@/server/wasmvm/sqldb';
import { useStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import JSONTable from '@/components/JSONTable';
import { eventBus } from '@/lib/event';

type Options = {};

export interface FlowDatabaseTemplateWidgetProps extends WidgetProps {
  options: Options;
}

export interface FlowDatabaseTemplateWidgetUIOptions {
  'ui:widget': (props: FlowDatabaseTemplateWidgetProps) => JSX.Element;
  'ui:options': Options;
}

const FlowDatabaseTemplate = observer(({ id, options, value, required, label, onChange }: FlowDatabaseTemplateWidgetProps) => {
  const {
    god: { sqlDB },
  } = useStore();
  const store = useLocalObservable(() => ({
    tables: [],
    curDBJSONCode: '',
    sql: ``,
    initDBTable: (code: string) => {
      store.tables = [];
      try {
        const tableJSONSchema: TableJSONSchema = JSON.parse(code);
        const _firstSchema = tableJSONSchema.schemas[0];
        const tables: { tableName: string; table: JSONSchemaTableState }[] = [];
        _firstSchema.tables.forEach((t) => {
          const { tableName, columns } = t;
          const columnNames = columns.map((c) => c.name);
          const res = sqlDB.db.exec(`SELECT * FROM ${tableName}`);
          const dataSource: { [key: string]: any }[] = [];
          if (res.length > 0) {
            res[0].values.forEach((i) => {
              const obj: { [key: string]: any } = {};
              i.forEach((j, index) => {
                obj[columnNames[index]] = j;
              });
              dataSource.push(obj);
            });
          }

          tables.push({
            tableName,
            table: new JSONSchemaTableState<any>({
              dataSource,
              columns: columnNames.map((i) => {
                return {
                  key: i,
                  label: i
                };
              })
              // containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
            })
          });
          store.tables = tables;
        });
      } catch (e) {
        console.log(e);
      }
    },
    get DBJSONs() {
      const files = [];
      const findSimulationCode = (arr) => {
        arr?.forEach((i) => {
          if (i.data?.dataType === 'sql') {
            files.push({ label: i.label, value: i.data.code, id: i.key });
          } else if (i.type === 'folder') {
            findSimulationCode(i.children);
          }
        });
      };
      findSimulationCode(globalThis.store?.w3s.projectManager.curFilesList ?? []);
      return files || [];
    }
  }));

  useEffect(() => {
    store.curDBJSONCode = store.DBJSONs[0]?.value;
    store.initDBTable(store.curDBJSONCode);
    eventBus.on('sql.change', () => store.initDBTable(store.curDBJSONCode));
    return () => {
      eventBus.off('sql.change', () => store.initDBTable(store.curDBJSONCode));
    };
  }, []);

  return (
    <>
      <Select
        w="200px"
        size="sm"
        onChange={(v) => {
          console.log(v.target.value);
          store.curDBJSONCode = v.target.value;
          store.initDBTable(v.target.value);
        }}
      >
        {store.DBJSONs?.map((i) => {
          return <option value={i.value}>{i.label}</option>;
        })}
      </Select>

      <Tabs mt={4}>
        <TabList>
          {store?.tables?.map((i) => {
            return <Tab key={i.tableName}>{i.tableName}</Tab>;
          })}
        </TabList>

        <Box mt={2} id="terminal" fontFamily="monospace" w="100%" h="calc(100vh - 630px)" whiteSpace="pre-line" overflowY="auto" position="relative">
          <TabPanels>
            {store?.tables?.map((i) => {
              return (
                <TabPanel p={0} key={i.tableName}>
                  <JSONTable
                    jsonstate={{
                      table: i.table
                    }}
                  />
                </TabPanel>
              );
            })}
          </TabPanels>
        </Box>
      </Tabs>
    </>
  );
});

const FlowDatabaseTemplateWidget = (props: FlowDatabaseTemplateWidgetProps) => {
  return <FlowDatabaseTemplate {...props} />;
};

export default FlowDatabaseTemplateWidget;

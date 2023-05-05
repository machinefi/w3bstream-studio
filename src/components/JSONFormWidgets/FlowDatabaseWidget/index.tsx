import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Box, Flex, Input, Tabs, TabList, TabPanels, Tab, TabPanel, Select } from '@chakra-ui/react';
import { assemblyScriptExample, envExample, flowExample, simulationExample, SqlExample } from '@/constants/initWASMExamples';
import { helper } from '@/lib/helper';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { FileIcon } from '@/components/Tree';
import { Schema, TableJSONSchema } from '@/server/wasmvm/sqldb';
import { useStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { toJS } from 'mobx';
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
  const [templateName, setTemplateName] = useState('');
  const {
    god: { sqlDB },
    w3s,
    w3s: {
      projectManager: { curFilesListSchema },
      lab
    }
  } = useStore();
  const store = useLocalObservable(() => ({
    tables: [],
    curDBJSONCode: '',
    sql: ``,
    initDBTable: (code: string) => {
      store.tables = [];
      try {
        const tableJSONSchema: TableJSONSchema = JSON.parse(curFilesListSchema.curActiveFile?.data?.code);
        const _firstSchema: Schema = tableJSONSchema.schemas[0];
        const tables: { tableName: string; columnName: string[]; table: JSONSchemaTableState }[] = [];
        _firstSchema.tables.forEach((i) => {
          const { tableName, columnName } = sqlDB.getTableInfoByJSONSchema(i);
          // console.log(tableName, columnName);
          // sqlDB.test();
          const res = sqlDB.db.exec(`SELECT * FROM ${tableName}`);
          // console.log(res);
          const dataSource: { [key: string]: any }[] = [];
          if (res.length > 0) {
            res[0].values.forEach((i) => {
              const obj: { [key: string]: any } = {};
              i.forEach((j, index) => {
                obj[columnName[index]] = j;
              });
              dataSource.push(obj);
            });
          }

          tables.push({
            tableName,
            columnName,
            table: new JSONSchemaTableState<any>({
              dataSource,
              columns: columnName.map((i) => {
                return {
                  key: i,
                  label: i
                };
              })
              // containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
            })
          });
          store.tables = tables;
          // console.log(toJS(tables));
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
            return <Tab>{i.tableName}</Tab>;
          })}
        </TabList>

        <Box mt={2} id="terminal" fontFamily="monospace" w="100%" h="calc(100vh - 630px)" whiteSpace="pre-line" overflowY="auto" position="relative">
          <TabPanels>
            {store?.tables?.map((i) => {
              return (
                <TabPanel p={0}>
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

import JSONTable from '@/components/JSONTable';
import dayjs from '@/lib/dayjs';
import { eventBus } from '@/lib/event';
import { Schema, TableJSONSchema } from '@/server/wasmvm/sqldb';
import { useStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { Box, Flex, Input, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { toJS } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { VscClearAll, VscDebugStart } from 'react-icons/vsc';

export const DBpanel = observer(() => {
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
    sql: ``,
    initDBTable: () => {
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
    }
  }));
  useEffect(() => {
    eventBus.on('sql.change', store.initDBTable);
    return () => {
      eventBus.off('sql.change', store.initDBTable);
    };
  }, []);

  useEffect(() => {
    store.initDBTable();
  }, [curFilesListSchema.curActiveFile]);

  return (
    <Box mt={2}>
      {store.tables.length > 0 && (
        <>
          <Flex align="center">
            <Input placeholder="write sql here" w="96%" value={store.sql} onChange={(e) => (store.sql = e.target.value)}></Input>
            <VscDebugStart
              style={{ marginLeft: 'auto', marginRight: '10px' }}
              fontSize={'19px'}
              onClick={(e) => {
                try {
                  sqlDB.exec(store.sql);
                } catch (e) {
                  console.log(e);
                  toast.error(e.message);
                }
                store.initDBTable();
              }}
            ></VscDebugStart>
          </Flex>
          <Tabs>
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
      )}
    </Box>
  );
});

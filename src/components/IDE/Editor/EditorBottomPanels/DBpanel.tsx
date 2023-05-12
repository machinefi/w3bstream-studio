import JSONTable from '@/components/JSONTable';
import dayjs from '@/lib/dayjs';
import { eventBus } from '@/lib/event';
import { TableJSONSchema } from '@/server/wasmvm/sqldb';
import { useStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { Box, Flex, Input, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
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
      )}
    </Box>
  );
});

export const ConsolePanel = observer(() => {
  const {
    w3s: {
      lab
    }
  } = useStore();
  const terminalRef = useRef(null);

  useEffect(() => {
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight * 10000;
  }, [lab.stdout]);

  return (
    <>
      <Flex borderTop={'2px solid #090909'} bg="#1e1e1e" color="white" pt={1}>
        <VscClearAll
          onClick={() => {
            lab.stdout = [];
            lab.stderr = [];
          }}
          cursor={'pointer'}
          style={{ marginLeft: 'auto', marginRight: '20px' }}
        />
      </Flex>
      <Box
        css={{
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#999999'
            // borderRadius: '24px'
          }
        }}
        ref={terminalRef}
        id="terminal"
        fontFamily="monospace"
        w="100%"
        h="calc(100vh - 580px)"
        p="10px"
        bg="#1e1e1e"
        color="white"
        whiteSpace="pre-line"
        overflowY="auto"
        position="relative"
      >
        {lab.stdout?.map((i) => {
          return (
            <Flex color={i?.['@lv'] == 'error' ? 'red' : ''}>
              <Flex mr={2} whiteSpace="nowrap">
                [<Box color="#d892ff">{i.prefix}</Box>
                <Box color="#ffd300">{dayjs(i?.['@ts']).format('hh:mm:ss')}</Box>]
              </Flex>
              {JSON.stringify({
                '@lv': i?.['@lv'],
                '@ts': i?.['@ts'],
                msg: i?.msg
              })}
            </Flex>
          );
        })}
      </Box>
    </>
  );
});

import { observer, useLocalObservable } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useStore } from '@/store/index';
import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import MonacoEditor from '@monaco-editor/react';
import { _ } from '@/lib/lodash';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { List, AutoSizer } from 'react-virtualized';
import { WasmLogType } from '@/server/routers/w3bstream';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc';

type LocalStoreType = {
  loading: boolean;
  initialized: boolean;
  logs: WasmLogType[];
  offset: number;
  limit: number;
  haveMore: boolean;
  setData: (data: Partial<LocalStoreType>) => void;
};

const fetchWasmLogs = async ({ projectName, limit = 20, offset = 0 }: { projectName: string; limit: number; offset: number }) => {
  try {
    const res = await trpc.api.wasmLogs.query({
      projectName,
      limit,
      offset
    });
    return res;
  } catch (error) {
    return [];
  }
};

const EventLogs = observer(() => {
  const {
    w3s: {
      publisher,
      project: { curProject }
    }
  } = useStore();

  const changeCodeRef = useRef(
    _.debounce((codeStr: string) => {
      publisher.publishEventForm.value.set({
        body: codeStr
      });
    }, 800)
  );

  const store = useLocalObservable<LocalStoreType>(() => ({
    loading: true,
    initialized: false,
    logs: [],
    limit: 20,
    offset: 0,
    haveMore: true,
    setData(data: Partial<LocalStoreType>) {
      Object.assign(store, data);
    }
  }));

  useEffect(() => {
    const projectName = curProject?.f_name;
    if (projectName) {
      fetchWasmLogs({ projectName, limit: store.limit, offset: 0 }).then((res) => {
        store.setData({
          logs: res,
          offset: 0,
          loading: false,
          haveMore: true
        });
      });
    }
  }, [curProject]);

  const { loading, logs } = store;

  return (
    <Box bg="#000">
      <Box p="1" fontSize="sm" fontWeight={700} color="#fff">
        Body:
      </Box>
      <Box pos="relative">
        <MonacoEditor
          height={300}
          theme="vs-dark"
          language="json"
          value={publisher.publishEventForm.formData.body}
          onChange={(v) => {
            changeCodeRef.current && changeCodeRef.current(v);
          }}
        />
        <Box pos="absolute" bottom={4} right={4} cursor="pointer">
          <Button
            type="submit"
            borderRadius="base"
            {...defaultOutlineButtonStyle}
            onClick={async () => {
              const projectName = curProject?.f_name;
              if (projectName) {
                const res = await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/event/${projectName}`,
                  headers: {
                    'Content-Type': 'text/plain'
                  },
                  data: publisher.parseBody()
                });
                if (res.data) {
                  await showNotification({ message: 'publish event succeeded' });
                  store.setData({
                    loading: true
                  });
                  fetchWasmLogs({ projectName, limit: store.limit, offset: 0 }).then((res) => {
                    store.setData({
                      logs: res.concat(logs),
                      offset: store.offset + logs.length,
                      loading: false
                    });
                  });
                }
              }
            }}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Flex align="center" p="1" fontSize="sm" fontWeight={700} color="#fff">
        Logs: {loading && <Spinner ml="10px" size="sm" color="#fff" />}
      </Flex>
      <Box height="calc(100vh - 480px)">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={logs.length}
              rowHeight={50}
              rowRenderer={({ index, key, style }) => {
                const item = logs[index];
                return (
                  <Flex px="20px" mb="10px" align="center" key={key} style={style} color="#fff">
                    <Text minW="160px" size="sm">
                      {dayjs(Number(item.f_created_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                    <Text minW="120px" ml="10px" size="sm" textAlign="center">
                      {item.f_level}
                    </Text>
                    <Text ml="10px" size="sm">
                      {item.f_msg}
                    </Text>
                  </Flex>
                );
              }}
              onScroll={async ({ clientHeight, scrollHeight, scrollTop }) => {
                if (scrollTop + clientHeight === scrollHeight) {
                  if (store.loading || !store.haveMore) {
                    return;
                  }
                  const projectName = curProject?.f_name;
                  if (projectName) {
                    store.setData({
                      loading: true
                    });
                    const offset = store.offset + store.limit;
                    const res = await fetchWasmLogs({
                      projectName,
                      offset,
                      limit: store.limit
                    });
                    store.setData({
                      offset,
                      loading: false,
                      logs: logs.concat(res),
                      haveMore: res.length === store.limit
                    });
                  }
                }
              }}
            />
          )}
        </AutoSizer>
      </Box>
    </Box>
  );
});

export default EventLogs;

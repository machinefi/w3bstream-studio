import { observer, useLocalObservable } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '@/store/index';
import { Box, Flex, Icon, Spinner, Text } from '@chakra-ui/react';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { List, AutoSizer } from 'react-virtualized';
import { WasmLogType } from '@/server/routers/w3bstream';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc';
import { VscDebugStart } from 'react-icons/vsc';
import { hooks } from '@/lib/hooks';
import { AiOutlineClear } from 'react-icons/ai';
import { TrueExpression } from 'types:assemblyscript/src/index-js';

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
    if (projectName && !store.initialized) {
      fetchWasmLogs({ projectName, limit: store.limit, offset: 0 }).then((res) => {
        store.setData({
          initialized: true,
          logs: res,
          offset: 0,
          loading: false,
          haveMore: true
        });
      });
    }
  }, [curProject, store.initialized]);

  const { loading, logs } = store;

  return (
    <Box pos="relative" bg="#000" borderRadius="8px">
      <Icon
        as={AiOutlineClear}
        pos="absolute"
        right="50px"
        top="10px"
        color="white"
        cursor="pointer"
        _hover={{
          color: '#946FFF'
        }}
        onClick={() => {
          store.setData({
            logs: [],
            offset: 0,
            haveMore: true,
            limit: 3
          });
        }}
      />
      <Icon
        as={VscDebugStart}
        pos="absolute"
        right="10px"
        top="10px"
        color="white"
        cursor="pointer"
        _hover={{
          color: '#946FFF'
        }}
        onClick={async () => {
          const formData = await hooks.getFormData({
            title: '',
            size: 'xl',
            formList: [
              {
                form: publisher.developerPublishEventForm
              }
            ]
          });
          const projectName = curProject?.f_name;
          if (projectName) {
            try {
              const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/event/${projectName}`,
                data: publisher.parseBody(formData.body)
              });
              const wasmResult = res.data?.[0].wasmResults?.[0];
              if (wasmResult) {
                if (wasmResult.errMsg) {
                  showNotification({ color: 'red', message: wasmResult.errMsg });
                } else {
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
              } else {
                showNotification({ color: 'red', message: 'Failed' });
              }
            } catch (error) {}
          }
        }}
      />
      <Flex align="center" p="10px 20px" fontSize="sm" fontWeight={700} color="#fff">
        Logs: {loading && <Spinner ml="10px" size="sm" color="#fff" />}
      </Flex>
      <Box height="calc(100vh - 180px)">
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

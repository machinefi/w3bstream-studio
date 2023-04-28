import { observer, useLocalObservable } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '@/store/index';
import { Box, Flex, Icon, Spinner, chakra, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { List, AutoSizer } from 'react-virtualized';
import { WasmLogType } from '@/server/routers/w3bstream';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc';
import { VscDebugStart } from 'react-icons/vsc';
import { hooks } from '@/lib/hooks';
import { AiOutlineClear } from 'react-icons/ai';
import { eventBus } from '@/lib/event';

type LocalStoreType = {
  loading: boolean;
  initialized: boolean;
  logs: WasmLogType[];
  offset: number;
  limit: number;
  haveMore: boolean;
  showModal: boolean;
  modalContent: string;
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
    w3s,
    w3s: {
      publisher,
      project: { curProject }
    }
  } = useStore();

  const store = useLocalObservable<LocalStoreType>(() => ({
    loading: true,
    initialized: false,
    logs: [],
    limit: 50,
    offset: 0,
    haveMore: true,
    showModal: false,
    modalContent: '',
    setData(data: Partial<LocalStoreType>) {
      Object.assign(store, data);
    }
  }));

  useEffect(() => {
    const projectName = curProject?.name;
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
            limit: 1
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
          publisher.developerPublishEventForm.afterSubmit = async ({ formData }) => {
            const projectName = curProject?.name;
            if (projectName) {
              const pub = publisher.allData.find((item) => item.project_id === curProject?.f_project_id);
              if (!pub) {
                showNotification({ color: 'red', message: 'Please create a publisher first' });
                eventBus.emit('base.formModal.abort');
                setTimeout(() => {
                  w3s.showContent = 'CURRENT_PUBLISHERS';
                }, 2000);
                return;
              }
              const timestamp = Date.now();
              const eventType = 'ANY';
              const eventID = pub.f_key || `${timestamp}`;
              const authorization = pub.f_token;
              const data = new Blob([formData.body], { type: 'text/plain' });
              try {
                const res = await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/event/${projectName}`,
                  headers: {
                    'Content-Type': 'application/octet-stream'
                  },
                  params: {
                    authorization,
                    eventID,
                    eventType,
                    timestamp
                  },
                  data
                });
                console.log('[Send test message]:', res);
                const result = res.data?.[0].results?.[0];
                if (result) {
                  if (result.error) {
                    showNotification({ color: 'red', message: result?.error });
                  } else {
                    store.setData({
                      loading: true
                    });
                    fetchWasmLogs({ projectName, limit: store.limit, offset: 0 }).then((res) => {
                      store.setData({
                        logs: res,
                        offset: 0,
                        loading: false
                      });
                    });
                  }
                } else {
                  showNotification({ color: 'red', message: 'Failed' });
                }
              } catch (error) {}
            }
          };
          hooks.getFormData({
            title: 'Send test message',
            size: 'xl',
            isAutomaticallyClose: false,
            isCentered: true,
            formList: [
              {
                form: publisher.developerPublishEventForm
              }
            ]
          });
        }}
      />
      <Flex align="center" p="10px 20px" fontSize="sm" fontWeight={700} color="#fff">
        Logs: {loading && <Spinner ml="10px" size="sm" color="#fff" />}
      </Flex>
      <Box height="calc(100vh - 180px)" px="20px">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={logs.length}
              rowHeight={20}
              rowRenderer={({ index, key, style }) => {
                const item = logs[index];
                return (
                  <chakra.p
                    key={key}
                    style={style}
                    color="#fff"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => {
                      const n = item.f_msg.split('message:');
                      const modalContent = n[1] || n[0];
                      store.setData({
                        showModal: true,
                        modalContent
                      });
                    }}
                  >
                    {dayjs(Number(item.f_created_at) * 1000).format('YYYY-MM-DD HH:mm:ss')}&nbsp;&nbsp;{item.f_level}&nbsp;&nbsp; {item.f_msg}
                  </chakra.p>
                );
              }}
              onScroll={async ({ clientHeight, scrollHeight, scrollTop }) => {
                if (scrollTop + clientHeight === scrollHeight) {
                  if (store.loading || !store.haveMore) {
                    return;
                  }
                  const projectName = curProject?.name;
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
      <Modal
        isOpen={store.showModal}
        onClose={() => {
          store.setData({
            showModal: false
          });
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="sm">Received Message:</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px" fontWeight={700}>
            {store.modalContent}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default EventLogs;

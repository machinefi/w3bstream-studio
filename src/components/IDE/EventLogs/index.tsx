import { observer, useLocalObservable } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '@/store/index';
import { Box, Flex, Icon, Spinner, chakra, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Select, shouldForwardProp } from '@chakra-ui/react';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { List, AutoSizer } from 'react-virtualized';
import { WasmLogType } from '@/server/routers/w3bstream';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc';
import { VscDebugStart } from 'react-icons/vsc';
import { hooks } from '@/lib/hooks';
import { AiOutlineClear } from 'react-icons/ai';
import { ShowRequestTemplatesButton } from '../PublishEventRequestTemplates';
import { motion, isValidMotionProp } from 'framer-motion';

const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and non-Chakra props to be forwarded.
   */
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

const LiveIcon = () => {
  return (
    <Box w="40px" pos="relative" boxSizing='border-box' transform="scale(0.6)">
      <ChakraBox
        w="30px"
        h="30px"
        m="0 auto 5px"
        borderRadius="50%"
        border="1px solid #946FFF"
        opacity="0.8"
        boxSizing='border-box'
        animate={{
          scale: [1, 1.5],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeatType: "loop",
          // @ts-ignore
          repeat: Infinity,
        }}
      />
      <ChakraBox
        pos="absolute"
        top="8px"
        left="13px"
        w="14px"
        h="14px"
        borderRadius="50%"
        opacity="0.8"
        boxSizing='border-box'
        bg="#946FFF"
        _after={{
          content: "''",
          display: 'block',
          border: '2px solid #946FFF',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          top: '-5px',
          left: '-5px',
          position: 'absolute',
          opacity: .8,
        }}
        animate={{
          scale: [1, 1.5],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeatType: "loop",
          // @ts-ignore
          repeat: Infinity,
        }}
      />
    </Box>
  )
}

type LocalStoreType = {
  loading: boolean;
  initialized: boolean;
  logs: WasmLogType;
  showModal: boolean;
  modalContent: string;
  fetchWasmLogsPoll: ReturnType<typeof poll>;
  setData: (data: Partial<LocalStoreType>) => void;
};

const fetchWasmLogs = async ({ projectName, limit = 20, gt, lt }: { projectName: string; limit?: number; gt?: number, lt?: number }) => {
  try {
    const data = await trpc.api.wasmLogs.query({
      projectName,
      limit,
      gt,
      lt
    });
    data.sort((a, b) => Number(a.f_created_at) - Number(b.f_created_at));
    return data;
  } catch (error) {
    return [];
  }
};

const poll = (fn: { (): Promise<void>; (): void; }, interval = 3000) => {
  let timer;
  let isStop = false;
  const executePoll = async () => {
    if (isStop) return;
    await fn()
    timer = setTimeout(executePoll, interval)
    return timer;
  }
  return {
    start: () => {
      timer && clearTimeout(timer);
      isStop = false;
      executePoll();
    },
    stop: () => {
      isStop = true;
      timer && clearTimeout(timer);
    }
  }
}

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
    showModal: false,
    modalContent: '',
    fetchWasmLogsPoll: poll(async () => {
      const logsLen = store.logs.length;
      const latestCreatedAt = store.logs[logsLen - 1]?.f_created_at;
      const limit = store.initialized ? 12 : 40;
      const res = await fetchWasmLogs({
        limit,
        projectName: curProject?.f_name,
        gt: latestCreatedAt ? Number(latestCreatedAt) : undefined,
      });
      store.setData({
        initialized: true,
        loading: false,
        logs: [...store.logs, ...res],
      });
    }),
    setData(data: Partial<LocalStoreType>) {
      Object.assign(store, data);
    },
  }));

  useEffect(() => {
    store.fetchWasmLogsPoll.start();
    return () => {
      store.fetchWasmLogsPoll.stop();
    }
  }, []);

  const { loading, logs } = store;

  return (
    <Box pos="relative" bg="#000" borderRadius="8px" minH={'calc(100vh - 158px)'}>
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
            publisher.records.push({
              type: formData.type,
              body: formData.body
            });
            try {
              store.fetchWasmLogsPoll.stop();
              const token = await hooks.waitPublisher();
              await axios.request({
                method: 'post',
                url: `/api/w3bapp/event/${curProject?.f_name}`,
                headers: {
                  Authorization: token,
                  'Content-Type': 'application/octet-stream'
                },
                params: {
                  eventType: formData.type || 'DEFAULT',
                  timestamp: Date.now()
                },
                data: formData.body
              });
              store.fetchWasmLogsPoll.start();
              showNotification({ color: 'green', message: 'Send event successed' });
            } catch (error) {
              showNotification({ color: 'red', message: 'send event failed' });
              store.fetchWasmLogsPoll.start();
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
            ],
            children: (
              <>
                <ShowRequestTemplatesButton
                  props={{
                    mt: '10px',
                    w: '100%'
                  }}
                />
                <Select
                  mt="10px"
                  placeholder="Select a history"
                  onChange={(e) => {
                    const index = Number(e.target.value);
                    publisher.records.currentIndex = index;
                    publisher.developerPublishEventForm.value.set({
                      ...publisher.records.current
                    });
                  }}
                >
                  {publisher.records.list.map((item, index) => (
                    <option value={index}>{item.body}</option>
                  ))}
                </Select>
              </>
            )
          });
        }}
      />
      <Flex align="center" p="10px 20px" fontSize="sm" fontWeight={700} color="#fff">
        Logs: {loading ? <Spinner ml="10px" size="sm" color="#fff" /> : <LiveIcon />}
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
                    color='#fff'
                    fontSize={"13px"}
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
                if (scrollTop === 0) {
                  if (store.loading) {
                    return;
                  }
                  store.fetchWasmLogsPoll.stop()
                  const projectName = curProject?.f_name;
                  if (projectName) {
                    store.setData({
                      loading: true,
                    });
                    const createdAt = store.logs[0]?.f_created_at;
                    const res = await fetchWasmLogs({
                      projectName,
                      limit: 50,
                      lt: createdAt ? Number(createdAt) : undefined,
                    });
                    store.setData({
                      loading: false,
                      logs: [...res, ...store.logs]
                    });
                  }
                }
                if (scrollTop + clientHeight === scrollHeight) {
                  store.fetchWasmLogsPoll.start();
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
          <ModalHeader fontSize="md">Received Message:</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="20px" fontWeight={400} fontSize={"13px"}>
            {store.modalContent}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

export default EventLogs;

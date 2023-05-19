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
import { eventBus } from '@/lib/event';
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
        top="7px"
        left="12px"
        w="16px"
        h="16px"
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
          top: '-4px',
          left: '-4px',
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
  log: WasmLogType;
  showModal: boolean;
  modalContent: string;
  setData: (data: Partial<LocalStoreType>) => void;
};

const fetchWasmLogs = async ({ projectName, limit = 20, page = 1 }: { projectName: string; limit?: number; page?: number }) => {
  try {
    const res = await trpc.api.wasmLogs.query({
      projectName,
      limit,
      page
    });
    res.data.sort((a, b) => Number(a.f_created_at) - Number(b.f_created_at));
    return res;
  } catch (error) {
    return {
      data: [],
      limit: 50,
      page: 1,
      hasNextPage: true
    };
  }
};

const poll = (fn: { (): Promise<void>; (): void; }, interval = 3000) => {
  let timer;
  const executePoll = async () => {
    fn()
    timer = setTimeout(executePoll, interval)
  }
  return {
    start: () => {
      executePoll()
    },
    stop: () => {
      clearTimeout(timer)
    }
  }
}

// const markLatestLogs = (logs: WasmLogType['data'], showAnimation = true) => {
//   const len = logs.length;
//   let latestTime;
//   for (let i = len - 1; i > 0; i--) {
//     const item = logs[i];
//     if (i === len - 1) {
//       latestTime = item.f_created_at;
//     }
//     // @ts-ignore
//     item.isLatest = showAnimation && item.f_created_at === latestTime;
//   }
//   return logs;
// };

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
    log: {
      data: [],
      limit: 50,
      page: 1,
      hasNextPage: true,
    },
    showModal: false,
    modalContent: '',
    setData(data: Partial<LocalStoreType>) {
      Object.assign(store, data);
    }
  }));

  useEffect(() => {
    const fetchWasmLogsPoll = poll(async () => {
      const res = await fetchWasmLogs({ projectName: curProject?.f_name, limit: log.limit });
      store.setData({
        initialized: true,
        loading: false,
        log: res,
      });
    })
    fetchWasmLogsPoll.start();
    return () => {
      fetchWasmLogsPoll.stop();
    }
  }, []);

  const { loading, log } = store;

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
            log: {
              data: [],
              limit: 50,
              page: 1,
              hasNextPage: true,
            },
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
            const projectName = curProject?.f_name;
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
              publisher.records.push({
                type: formData.type,
                body: formData.body
              });
              try {
                const res = await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/event/${projectName}`,
                  headers: {
                    Authorization: pub.f_token,
                    'Content-Type': 'application/octet-stream'
                  },
                  params: {
                    eventType: formData.type || 'DEFAULT',
                    timestamp: Date.now()
                  },
                  data: formData.body
                });
                console.log('[Send test message]:', res);
                showNotification({ color: 'green', message: 'Send event successed' });
                // store.setData({
                //   loading: true
                // });
                // fetchWasmLogs({ projectName, limit: 30 }).then((res) => {
                //   markLatestLogs(res.data);
                //   store.setData({
                //     log: res,
                //     loading: false
                //   });
                // });
              } catch (error) {
                showNotification({ color: 'red', message: 'send event failed' });
              }
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
      <Box height="100%" px="20px">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={log.data.length}
              rowHeight={20}
              rowRenderer={({ index, key, style }) => {
                const item = log.data[index];
                return (
                  <chakra.p
                    key={key}
                    style={style}
                    // @ts-ignore
                    color={item.isLatest ? '#946FFF' : '#fff'}
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
            // onScroll={async ({ clientHeight, scrollHeight, scrollTop }) => {
            //   if (scrollTop + clientHeight === scrollHeight) {
            //     if (store.loading || !log.hasNextPage) {
            //       return;
            //     }
            //     const projectName = curProject?.f_name;
            //     if (projectName) {
            //       store.setData({
            //         loading: true
            //       });
            //       const res = await fetchWasmLogs({
            //         projectName,
            //         limit: log.limit,
            //         page: log.page + 1,
            //       });
            //       store.setData({
            //         loading: false,
            //         log: {
            //           data: res.data.concat(log.data),
            //           limit: res.limit,
            //           page: res.page,
            //           hasNextPage: res.hasNextPage
            //         },
            //       });
            //     }
            //   }
            // }}
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

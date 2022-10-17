import { useEffect } from 'react';
import { Button, Flex, TableContainer, Table, Thead, Tr, Th, Tbody, Td, useDisclosure, Badge } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { W3bStream } from '@/store/lib/w3bstream';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import SimplePagination from '@/components/Common/SimplePagination';
import { PaginationState } from '@/store/standard/PaginationState';
import { INSTANCE_STATUS } from '../AllInstances';
import { gradientButtonStyle } from '@/lib/theme';

const AppletTable = observer(() => {
  const { w3s } = useStore();
  const store = useLocalObservable(() => ({
    paginationState: new PaginationState({
      page: 1,
      limit: 8
    })
  }));

  const applets = w3s.showContent === 'CURRENT_APPLETS' ? w3s.curProject?.applets || [] : w3s.allApplets;

  useEffect(() => {
    store.paginationState.setData({
      total: applets.length
    });
  }, [applets]);

  const dataSource = applets.slice(store.paginationState.offset, store.paginationState.offset + store.paginationState.limit);

  return (
    <>
      <Flex alignItems="center">
        <Button
          h="32px"
          leftIcon={<AddIcon />}
          {...gradientButtonStyle}
          onClick={(e) => {
            //@ts-ignore
            w3s.createApplet.value.set({
              info: {
                projectID: w3s.showContent === 'CURRENT_APPLETS' ? w3s.curProject?.f_project_id : '',
                appletName: ''
              }
            });
            w3s.createApplet.extraValue.set({ modal: { show: true } }, { force: false });
          }}
        >
          Add Applet
        </Button>
      </Flex>
      <TableContainer mt={4} h="calc(100vh - 200px)" overflowY="auto">
        <Table variant="simple">
          <Thead>
            <Tr h="54px" bg="#F5F5F5">
              <Th></Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Applet ID
              </Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Name
              </Th>
              {w3s.showContent === 'ALL_APPLETS' && (
                <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                  Project Name
                </Th>
              )}
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {dataSource.map((applet) => {
              return <CollapseTable key={applet.f_applet_id} applet={applet} w3s={w3s} />;
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <SimplePagination
        mt="10px"
        total={store.paginationState.total}
        limit={store.paginationState.limit}
        page={store.paginationState.page}
        onPageChange={(currentPage) => {
          store.paginationState.setData({
            page: currentPage
          });
        }}
      />
    </>
  );
});

function CollapseTable({ applet, w3s }: { applet: Partial<{ f_name: string; f_project_id: string; f_applet_id: string; project_name?: string; instances: any[] }>; w3s: W3bStream }) {
  const { isOpen, onToggle } = useDisclosure();
  const styles = isOpen ? { display: 'table-row' } : { display: 'none' };

  return (
    <>
      <Tr h="54px" fontSize="14px" color="#0F0F0F">
        <Td w="40px">{isOpen ? <ChevronDownIcon w={6} h={6} onClick={onToggle} cursor="pointer" /> : <ChevronRightIcon w={6} h={6} onClick={onToggle} cursor="pointer" />}</Td>
        <Td w="300px">{applet.f_applet_id}</Td>
        <Td w="140px">{applet.f_name}</Td>
        {w3s.showContent === 'ALL_APPLETS' && <Td w="140px">{applet.project_name}</Td>}
        <Td>
          {applet.instances.length > 0 ? (
            <>
              <Button
                h="32px"
                bg="#6FB2FF"
                color="#fff"
                borderRadius="base"
                _hover={{ opacity: 0.8 }}
                _active={{
                  opacity: 0.6
                }}
                onClick={(e) => {
                  w3s.publishEvent.value.set({
                    projectID: applet.f_project_id,
                    appletID: applet.f_applet_id,
                    handler: 'start',
                    data: ''
                  });
                  w3s.publishEvent.extraValue.set({
                    modal: {
                      show: true
                    }
                  });
                }}
              >
                Send Event
              </Button>
              <Button
                ml="8px"
                h="32px"
                variant="outline"
                borderRadius="base"
                borderColor="#6FB2FF"
                color="#6FB2FF"
                onClick={() => {
                  copy(
                    `curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${applet.f_project_id}/${applet.f_applet_id}/start' --header 'publisher: "admin"' --header 'Content-Type: text/plain' --data-raw 'input event'`
                  );
                  toast.success('Copied');
                }}
              >
                Copy
              </Button>
            </>
          ) : (
            <Button
              colorScheme="blue"
              size="xs"
              borderRadius="base"
              onClick={(e) => {
                if (applet.instances.length === 0) {
                  w3s.deployApplet.call({ appletID: applet.f_applet_id });
                }
              }}
            >
              Deploy
            </Button>
          )}
        </Td>
      </Tr>
      <Tr {...styles}>
        <Td></Td>
        <Td colSpan={4}>
          <TableContainer>
            <Table>
              <Thead>
                <Tr h="54px" bg="#F5F5F5">
                  <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                    Instance ID
                  </Th>
                  <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                    Status
                  </Th>
                  <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {applet.instances.map((item) => (
                  <Tr h="54px" key={item.f_instance_id}>
                    <Td w="340px">{item.f_instance_id}</Td>
                    <Td w="120px">
                      <Badge variant="outline" colorScheme={INSTANCE_STATUS[item.f_state].colorScheme}>
                        {INSTANCE_STATUS[item.f_state].text}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        h="32px"
                        bg="#37A169"
                        color="#fff"
                        borderRadius="base"
                        _hover={{ opacity: 0.8 }}
                        _active={{
                          opacity: 0.6
                        }}
                        onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'START' })}
                      >
                        Start
                      </Button>
                      <Button
                        ml="8px"
                        h="32px"
                        bg="#FAB400"
                        color="#fff"
                        borderRadius="base"
                        _hover={{ opacity: 0.8 }}
                        _active={{
                          opacity: 0.6
                        }}
                        onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'Restart' })}
                      >
                        Restart
                      </Button>
                      <Button
                        ml="8px"
                        h="32px"
                        bg="#E53E3E"
                        color="#fff"
                        borderRadius="base"
                        _hover={{ opacity: 0.8 }}
                        _active={{
                          opacity: 0.6
                        }}
                        onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'STOP' })}
                      >
                        Stop
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Td>
      </Tr>
    </>
  );
}

export default AppletTable;

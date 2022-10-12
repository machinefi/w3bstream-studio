import { useEffect } from 'react';
import { Button, Flex, TableContainer, Table, Thead, Tr, Th, Tbody, Td, useDisclosure, Badge, Center, Stack, Text } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { AddIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { W3bStream } from '@/store/lib/w3bstream';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';
import SimplePagination from '@/components/Common/SimplePagination';
import { PaginationState } from '@/store/standard/PaginationState';
import { INSTANCE_STATUS } from '../AllInstances';

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

  if (!w3s.curProject) {
    return (
      <Center h="300px">
        <Stack>
          <Text fontSize="2xl"> You have no any project.</Text>
          <Button
            borderRadius="base"
            onClick={() => {
              w3s.createProject.setExtraData({
                modal: {
                  show: true,
                }
              });
            }}
          >
            Create project
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <TableContainer>
        <Flex alignItems="center">
          <Text fontSize="xl" fontWeight={600}>
            Applets
          </Text>
          <Button
            ml={6}
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="xs"
            borderRadius="base"
            onClick={(e) => {
              //@ts-ignore
              w3s.createApplet.setData({
                info: {
                  projectID: w3s.showContent === 'CURRENT_APPLETS' ? w3s.curProject.f_project_id : '',
                  appletName: ''
                }
              });
              w3s.createApplet.setExtraData({
                modal: {
                  show: true,
                }
              });
            }}
          >
            Add Applet
          </Button>
        </Flex>
        <Table mt={4} variant="simple">
          <Thead>
            <Tr bg="#FAFAFA">
              <Th></Th>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {dataSource.map((applet) => {
              return <CollapseTable key={applet.f_applet_id} applet={applet} w3s={w3s} />;
            })}
          </Tbody>
        </Table>
        <SimplePagination
          total={store.paginationState.total}
          limit={store.paginationState.limit}
          page={store.paginationState.page}
          onPageChange={(currentPage) => {
            store.paginationState.setData({
              page: currentPage
            });
          }}
        />
      </TableContainer>
    </>
  );
});

function CollapseTable({ applet, w3s }: { applet: Partial<{ f_name: string; f_project_id: string; f_applet_id: string; instances: any[] }>; w3s: W3bStream }) {
  const { isOpen, onToggle } = useDisclosure();
  const styles = isOpen ? { display: 'table-row' } : { display: 'none' };

  return (
    <>
      <Tr>
        <Td w="40px">{isOpen ? <ChevronDownIcon w={6} h={6} onClick={onToggle} cursor="pointer" /> : <ChevronRightIcon w={6} h={6} onClick={onToggle} cursor="pointer" />}</Td>
        <Td w="300px">{applet.f_applet_id}</Td>
        <Td w="140px">{applet.f_name}</Td>
        <Td>
          {applet.instances.length > 0 ? (
            <>
              <Button colorScheme="blue" size="xs" borderRadius="base" onClick={(e) => w3s.publishEvent.call({ appletID: applet.f_applet_id, projectID: applet.f_project_id })}>
                Send Event
              </Button>
              <Button
                ml={4}
                colorScheme="blue"
                size="xs"
                borderRadius="base"
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
        <Td colSpan={3}>
          <TableContainer>
            <Table size="sm">
              <Thead bg="#EAF5FE">
                <Tr>
                  <Th>ID</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {applet.instances.map((item) => (
                  <Tr bg="#F2FAFB" key={item.f_instance_id}>
                    <Td w="340px">{item.f_instance_id}</Td>
                    <Td w="120px">
                      <Badge colorScheme={INSTANCE_STATUS[item.f_state].colorScheme}>{INSTANCE_STATUS[item.f_state].text}</Badge>
                    </Td>
                    <Td>
                      <Button colorScheme="green" size="xs" borderRadius="base" onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'START' })}>
                        Start
                      </Button>
                      <Button ml={4} colorScheme="yellow" size="xs" borderRadius="base" onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'Restart' })}>
                        Restart
                      </Button>
                      <Button ml={4} colorScheme="red" size="xs" borderRadius="base" onClick={(e) => w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'STOP' })}>
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

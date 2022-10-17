import { Button, Flex, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Badge } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { PaginationState } from '@/store/standard/PaginationState';
import SimplePagination from '@/components/Common/SimplePagination';
import { useEffect } from 'react';

export const INSTANCE_STATUS = {
  0: {
    colorScheme: 'gray',
    text: ''
  },
  1: {
    colorScheme: 'gray',
    text: 'idle'
  },
  2: {
    colorScheme: 'green',
    text: 'running'
  },
  3: {
    colorScheme: 'red',
    text: 'stop'
  }
};

const AllInstances = observer(() => {
  const {
    w3s,
    w3s: { allInstances }
  } = useStore();

  const store = useLocalObservable(() => ({
    paginationState: new PaginationState({
      page: 1,
      limit: 8
    })
  }));

  useEffect(() => {
    store.paginationState.setData({
      total: allInstances.length
    });
  }, [allInstances]);

  const dataSource = allInstances.slice(store.paginationState.offset, store.paginationState.offset + store.paginationState.limit);

  return (
    <>
      <TableContainer h="calc(100vh - 160px)" overflowY="auto">
        <Table>
          <Thead>
            <Tr h="54px" bg="#F5F5F5">
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Status
              </Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Actions
              </Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                ID
              </Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Project Name
              </Th>
              <Th fontSize="14px" fontWeight={700} color="#0F0F0F">
                Applet Name
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {dataSource.map((item) => (
              <Tr key={item.f_instance_id} h="54px" fontSize="14px" color="#0F0F0F">
                <Td>
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
                <Td>{item.f_instance_id}</Td>
                <Td>{item.project_name}</Td>
                <Td>{item.applet_name}</Td>
              </Tr>
            ))}
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

export default AllInstances;

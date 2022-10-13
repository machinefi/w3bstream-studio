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
      limit: 10
    })
  }));

  useEffect(() => {
    store.paginationState.setData({
      total: allInstances.length
    });
  }, [allInstances]);

  const dataSource = allInstances.slice(store.paginationState.offset, store.paginationState.offset + store.paginationState.limit);

  return (
    <TableContainer>
      <Flex fontSize="xl" fontWeight={600}>
        All Instances
      </Flex>
      <Table mt={2} size="sm">
        <Thead bg="#EAF5FE">
          <Tr>
            <Th>Status</Th>
            <Th>Actions</Th>
            <Th>ID</Th>
            <Th>Project Name</Th>
            <Th>Applet Name</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dataSource.map((item) => (
            <Tr bg="#F2FAFB" key={item.f_instance_id}>
              <Td>
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
              <Td>{item.f_instance_id}</Td>
              <Td>{item.project_name}</Td>
              <Td>{item.applet_name}</Td>
            </Tr>
          ))}
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
  );
});

export default AllInstances;

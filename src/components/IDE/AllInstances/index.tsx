import { Box, Button, chakra, Text, Flex, TableContainer, Table, Thead, Tr, Th, Tbody, Td, Badge } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

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
          {allInstances.map((item) => (
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
    </TableContainer>
  );
});

export default AllInstances;

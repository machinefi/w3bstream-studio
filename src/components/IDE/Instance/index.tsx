import { Box, Button, chakra, Text, Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

const STATUS = {
  0: {
    color: '#000',
    text: ''
  },
  1: {
    color: '#000',
    text: 'idle'
  },
  2: {
    color: 'green',
    text: 'running'
  },
  3: {
    color: 'red',
    text: 'stop'
  }
};

const Instance = observer(() => {
  const { w3s } = useStore();
  return (
    <Box mt="xl">
      <Text fontWeight={600}>Instance:</Text>
      {w3s.curApplet?.instances.map((i, index) => {
        return (
          <Box mt={2} p={2} w="400px" bg="#f5f2f1" borderRadius="md">
            <Box>{i.f_instance_id}</Box>
            <Box mt={2} fontSize="sm">
              Status: <chakra.span color={STATUS[i.f_state].color}>{STATUS[i.f_state].text}</chakra.span>
            </Box>
            <Flex mt={2}>
              <Button color="green" size="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'START' })}>
                Start
              </Button>
              <Button ml={4} color="#ff9900" size="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'Restart' })}>
                Restart
              </Button>
              <Button ml={4} color="red" size="xs" onClick={(e) => w3s.handleInstance.call({ instaceID: i.f_instance_id, event: 'STOP' })}>
                Stop
              </Button>
            </Flex>
          </Box>
        );
      })}
    </Box>
  );
});

export default Instance;

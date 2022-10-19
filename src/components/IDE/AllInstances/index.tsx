import { Badge, Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Table from '@/components/Table';

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

export const InstanceStatus = ({ state }: { state: number }) => {
  return (
    <Badge variant="outline" colorScheme={INSTANCE_STATUS[state].colorScheme}>
      {INSTANCE_STATUS[state].text}
    </Badge>
  );
};

export const InstanceActions = observer(({ data }: { data: Partial<{ f_instance_id: string }> }) => {
  const { w3s } = useStore();

  return (
    <>
      <Button
        h="32px"
        bg="#37A169"
        color="#fff"
        _hover={{ opacity: 0.8 }}
        _active={{
          opacity: 0.6
        }}
        onClick={(e) => w3s.handleInstance.call({ instaceID: data.f_instance_id, event: 'START' })}
      >
        Start
      </Button>
      <Button
        ml="8px"
        h="32px"
        bg="#FAB400"
        color="#fff"
        _hover={{ opacity: 0.8 }}
        _active={{
          opacity: 0.6
        }}
        onClick={(e) => w3s.handleInstance.call({ instaceID: data.f_instance_id, event: 'Restart' })}
      >
        Restart
      </Button>
      <Button
        ml="8px"
        h="32px"
        bg="#E53E3E"
        color="#fff"
        _hover={{ opacity: 0.8 }}
        _active={{
          opacity: 0.6
        }}
        onClick={(e) => w3s.handleInstance.call({ instaceID: data.f_instance_id, event: 'STOP' })}
      >
        Stop
      </Button>
    </>
  );
});

const AllInstances = observer(() => {
  const {
    w3s: { allInstances }
  } = useStore();

  return (
    <Table
      columns={[
        {
          key: 'f_state',
          label: 'Status',
          render(item) {
            return <InstanceStatus state={item.f_state} />;
          }
        },
        {
          key: 'actions',
          label: 'Actions',
          render(item) {
            return <InstanceActions data={item} />;
          }
        },
        {
          key: 'f_instance_id',
          label: 'Instance ID'
        },
        {
          key: 'project_name',
          label: 'Project Name'
        },
        {
          key: 'applet_name',
          label: 'Applet Name'
        }
      ]}
      dataSource={allInstances}
      rowKey="f_instance_id"
      chakraTableContainerProps={{ h: 'calc(100vh - 160px)' }}
    />
  );
});

export default AllInstances;

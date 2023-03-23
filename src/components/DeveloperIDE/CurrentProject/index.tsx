import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import ToolBar from '../ToolBar';
import Metrics from '../Metrics';
import Publishers from '@/components/IDE/Publishers';
import Triggers from '../Triggers';
import DBTable from '../DeveloperDBTable';
import EventLogs from '@/components/IDE/EventLogs';
import Settings from '../Settings';

const CurrentProject = observer(() => {
  const { w3s } = useStore();

  return (
    <Flex w="100%" h="calc(100vh - 100px)">
      <ToolBar borderRadius="8px" overflowY="auto" />
      <Box ml="20px" w="100%" h="100%" p="20px" bg="#fff" borderRadius="8px">
        {w3s.showContent === 'METRICS' && <Metrics />}
        {w3s.showContent === 'CURRENT_PUBLISHERS' && <Publishers />}
        {(w3s.showContent === 'ALL_CONTRACT_LOGS' || w3s.showContent === 'All_CHAIN_TX' || w3s.showContent === 'All_CHAIN_HEIGHT') && <Triggers />}
        {w3s.showContent === 'DB_TABLE' && <DBTable />}
        {w3s.showContent === 'CURRENT_EVENT_LOGS' && <EventLogs />}
        {w3s.showContent === 'SETTINGS' && <Settings />}
      </Box>
    </Flex>
  );
});

export default CurrentProject;

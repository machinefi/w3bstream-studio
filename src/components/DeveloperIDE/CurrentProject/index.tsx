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
import { ChevronLeftIcon } from '@chakra-ui/icons';

const CurrentProject = observer(() => {
  const {
    w3s: { showContent, project }
  } = useStore();

  return (
    <Flex w="100%">
      <ToolBar borderRadius="8px" overflowY="auto" />
      <Box ml="220px" w="100%" p="20px" bg="#fff" boxSizing='content-box' borderRadius="8px">
        {showContent === 'METRICS' && <Metrics />}
        {showContent === 'CURRENT_PUBLISHERS' && <Publishers />}
        {(showContent === 'CONTRACT_LOGS' || showContent === 'CHAIN_TX' || showContent === 'CHAIN_HEIGHT') && <Triggers />}
        {showContent === 'DB_TABLE' && <DBTable />}
        {showContent === 'CURRENT_EVENT_LOGS' && <EventLogs />}
        {showContent === 'SETTINGS' && <Settings />}
      </Box>
    </Flex>
  );
});


export default CurrentProject;

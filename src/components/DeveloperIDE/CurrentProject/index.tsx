import React from 'react';
import { Flex, Box, Tooltip, Button } from '@chakra-ui/react';
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
import { MdRefresh } from 'react-icons/md';
import { UnstyledButton } from '@mantine/core';

const CurrentProject = observer(() => {
  const {
    w3s,
    w3s: { showContent, project }
  } = useStore();

  return (
      <Flex w="100%" minH="100%" position="relative">
        <ToolBar borderRadius="8px" overflowY="auto" />
        <Box ml="220px" w="calc(100% - 220px)" minH="100%" p="12px 24px" bg="#fff" borderRadius="8px">
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

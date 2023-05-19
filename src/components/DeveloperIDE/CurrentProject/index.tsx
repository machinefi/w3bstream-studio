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
      <Flex w="100%" position="relative">
        <ToolBar borderRadius="8px" overflowY="auto" />
        <Box ml="220px" w="100%" h="100%" p="20px" pb="50px" bg="#fff" boxSizing="content-box" borderRadius="8px">
          <Flex mb={4}>
            <Button
              ml="auto"
              size="sm"
              onClick={(e) => {
                w3s.init();
              }}
            >
              <MdRefresh />
            </Button>
          </Flex>
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

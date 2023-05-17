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
    <Box>
      <Flex
        mb="15px"
        alignItems="center"
        color="#0F0F0F"
        fontSize="14px"
        cursor="pointer"
        bg="#fff"
        p="10px 15px"
        w="86px"
        borderRadius='4px'
        onClick={() => {
          project.allProjects.onSelect(-1);
          project.resetSelectedNames();
        }}
      >
        <ChevronLeftIcon />
        <Box ml="10px">Back</Box>
      </Flex>
      <Flex w="100%" h="calc(100vh - 180px)" overflow={'hidden'} position="relative">
        <ToolBar borderRadius="8px" overflowY="auto" />
        <Box ml="20px" w="100%" h="100%" p="20px" pb="50px" bg="#fff" boxSizing='content-box' borderRadius="8px" overflow={'auto'}>
          {showContent === 'METRICS' && <Metrics />}
          {showContent === 'CURRENT_PUBLISHERS' && <Publishers />}
          {(showContent === 'CONTRACT_LOGS' || showContent === 'CHAIN_TX' || showContent === 'CHAIN_HEIGHT') && <Triggers />}
          {showContent === 'DB_TABLE' && <DBTable />}
          {showContent === 'CURRENT_EVENT_LOGS' && <EventLogs />}
          {showContent === 'SETTINGS' && <Settings />}
        </Box>
      </Flex>
    </Box>
  );
});


export default CurrentProject;

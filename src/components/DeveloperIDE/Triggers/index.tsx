import React, { useState } from 'react';
import { Flex, Box, Tabs, TabList, TabPanels, TabPanel, Tab, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import ContractLogs, { CreateContractLogButton } from '@/components/IDE/Monitor/ContractLogs';
import ChainHeight, { CreateChainHeightButton } from '@/components/IDE/Monitor/ChainHeight';
import Strategies, { CreateStrategyButton } from '@/components/IDE/Strategies';
import { ShowRequestTemplatesButton } from '@/components/IDE/PublishEventRequestTemplates';
import CronJobs, { CreateCronJobButton } from '../CronJob';

const Triggers = () => {
  const {
    w3s: {
      env: { envs },
      project: { curProject }
    }
  } = useStore();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box w="100%" minH={'calc(100vh - 158px)'}>
      <Flex alignItems="center" justifyContent={'space-between'}>
        <Box flex="1">
          <Text fontSize={'1.5rem'} fontWeight={700}>Event Source</Text>
        </Box>
        <ShowRequestTemplatesButton
          props={{
            ml: '10px',
            size: 'sm'
          }}
        />
      </Flex>
      <Box mt="20px" fontSize="14px" color="#7A7A7A">
        HTTP
      </Box>
      <Flex mt="10px" alignItems="center">
        <Box w="60px" fontSize="14px" color="#0F0F0F">
          Route:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" border="1px solid #EDEDED" borderRadius="6px" wordBreak={'break-all'}>
          {envs.value?.httpURL.replace(':projectName', curProject?.f_name)}
        </Box>
      </Flex>
      <Box mt="20px" fontSize="14px" color="#7A7A7A">
        MQTT
      </Box>
      <Flex mt="10px" alignItems="center">
        <Box w="60px" fontSize="14px" color="#0F0F0F">
          URL:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" border="1px solid #EDEDED" borderRadius="6px">
          {envs.value?.mqttURL}
        </Box>
      </Flex>
      <Flex mt="10px" alignItems="center">
        <Box w="60px" fontSize="14px" color="#0F0F0F">
          Topic:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" border="1px solid #EDEDED" borderRadius="6px">
          {curProject?.f_name}
        </Box>
      </Flex>

      <Tabs mt="20px" index={tabIndex} onChange={(index) => setTabIndex(index)}>
        <Flex alignItems="center" justifyContent="space-between">
          <TabList>
            <Tab _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>Cron Job</Tab>
            <Tab ml="100px" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Smart Contract Monitor
            </Tab>
            <Tab ml="100px" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Chain Height Monitor
            </Tab>
          </TabList>
          {tabIndex === 0 && <CreateCronJobButton />}
          {tabIndex === 1 && <CreateContractLogButton />}
          {tabIndex === 2 && <CreateChainHeightButton />}
        </Flex>
        <TabPanels>
          <TabPanel px="0px">
            <CronJobs />
          </TabPanel>
          <TabPanel px="0px">
            <ContractLogs />
          </TabPanel>
          <TabPanel px="0px">
            <ChainHeight />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Flex mb="10px" alignItems="center" justifyContent="space-between">
        <Box fontSize="18px" color="#0F0F0F" fontWeight={700}>
          Event Routing
        </Box>
        <CreateStrategyButton />
      </Flex>
      <Strategies />
    </Box>
  );
};

export default observer(Triggers);

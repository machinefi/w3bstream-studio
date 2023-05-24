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
      <Flex alignItems="flex-start" justifyContent={'space-between'}>
        <Box flex="1">
          <Text fontSize={'1.5rem'} fontWeight={700}>Event Sources</Text>
          <Text color={'#7A7A7A'} fontSize="14px">You can create various W3bstream events that can be generated from diverse sources: through an HTTP or MQTT data message or utizing internal sources such as the Cron Job or Smart Contract Monitor.</Text>
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
        <Box w="60px" fontSize="12px" color="#0F0F0F" fontWeight={400}>
          Route:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" fontSize={"14px"}  border="1px solid #EDEDED" borderRadius="6px" wordBreak={'break-all'}>
          {envs.value?.httpURL.replace(':projectName', curProject?.f_name)}
        </Box>
      </Flex>
      <Box mt="10px" fontSize="14px" color="#7A7A7A">
        MQTT
      </Box>
      <Flex mt="10px" alignItems="center">
        <Box w="60px" color="#0F0F0F" fontSize={"12px"}>
          URL:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" fontSize={"14px"} border="1px solid #EDEDED" borderRadius="6px">
          {envs.value?.mqttURL}
        </Box>
      </Flex>
      <Flex mt="10px" alignItems="center">
        <Box w="60px" color="#0F0F0F" fontSize={"12px"}>
          Topic:
        </Box>
        <Box ml="14px" w="100%" p="8px 10px" border="1px solid #EDEDED" borderRadius="6px" fontSize={"14px"}>
          {curProject?.f_name}
        </Box>
      </Flex>

      <Box mt="40px" fontSize="18px" color="#0F0F0F" fontWeight={600}>
        Event Monitor
        </Box>
      <Tabs  index={tabIndex} onChange={(index) => setTabIndex(index)} mt="10px">
        <Flex alignItems="center" justifyContent="space-between">
          <TabList>
            <Tab fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>Cron Job</Tab>
            <Tab fontSize={'14px'} ml="100px" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Smart Contract Monitor
            </Tab>
            <Tab fontSize={'14px'} ml="100px" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
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

      <Flex mb="10px" alignItems="flex-start" justifyContent="space-between">
        <Flex flexDirection={'column'}>
          <Box fontSize="18px" color="#0F0F0F" fontWeight={700}>
            Event Routing
          </Box>
          <Text color={'#7A7A7A'} fontSize="14px">Once a W3bstream event is raised by a certain source,it can be "routed"to an handler function exported in your applet. Each time that event is raised in W3bstream, the event payload is passed as an argument to the handler, and the handler is then executed by W3bstream.</Text>
        </Flex>
        <Box flex={1}>
          <CreateStrategyButton />
        </Box>
      </Flex>
      <Strategies />
    </Box>
  );
};

export default observer(Triggers);

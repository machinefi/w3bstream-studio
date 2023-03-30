import React from 'react';
import { Flex, Box, Icon } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { JSONMetricsView } from '@/components/JSONMetricsView';
import { getSelectedStyles } from '../ToolBar';
import { HiOutlineDatabase } from 'react-icons/hi';
import { TbApi } from 'react-icons/tb';

const Metrics = () => {
  const { w3s } = useStore();

  return (
    <Flex w="100%" h="calc(100vh - 150px)">
      <Flex minW="100px" direction="column" align="center" bg="#fff" borderRadius="8px" overflowY="auto">
        <Flex
          w="100%"
          p="18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.metrics.showContent === 'API')}
          onClick={(e) => {
            w3s.metrics.showContent = 'API';
          }}
        >
          <Icon as={TbApi} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            API
          </Box>
        </Flex>
        <Flex
          mt="16px"
          w="100%"
          p="18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.metrics.showContent === 'DATABASE')}
          onClick={(e) => {
            w3s.metrics.showContent = 'DATABASE';
          }}
        >
          <Icon as={HiOutlineDatabase} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            Database
          </Box>
        </Flex>
      </Flex>
      <Box ml="20px" flex={1} borderRadius="8px">
        <JSONMetricsView data={w3s.metrics.metricsData} showContent={w3s.metrics.showContent}/>
      </Box>
    </Flex>
  );
};

export default observer(Metrics);

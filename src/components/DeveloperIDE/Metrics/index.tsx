import React, { useEffect } from 'react';
import { Flex, Box, Icon } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { JSONMetricsView } from '@/components/JSONMetricsView';
import { getSelectedStyles } from '../ToolBar';
import { HiOutlineDatabase } from 'react-icons/hi';
import { TbApi } from 'react-icons/tb';

const Metrics = () => {
  const {
    w3s: { metrics }
  } = useStore();

  useEffect(() => {
    metrics.activeDevices.call();
    metrics.dataMessages.call();
    metrics.blockchainTransaction.call();
  }, []);

  return (
    <Box w="100%">
      <Flex mb="10px" align="center" bg="#fff" borderRadius="8px">
        <Flex
          p="10px 20px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(metrics.showContent === 'API')}
          onClick={(e) => {
            metrics.showContent = 'API';
          }}
        >
          <Icon as={TbApi} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            API
          </Box>
        </Flex>
        <Flex
          ml="10px"
          p="10px 20px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(metrics.showContent === 'DATABASE')}
          onClick={(e) => {
            metrics.dbState.call();
            metrics.showContent = 'DATABASE';
          }}
        >
          <Icon as={HiOutlineDatabase} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            Database
          </Box>
        </Flex>
      </Flex>
      <JSONMetricsView data={metrics.metricsData} />
    </Box>
  );
};

export default observer(Metrics);

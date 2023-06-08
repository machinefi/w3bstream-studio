import React from 'react';
import { Flex, Box, Icon, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { JSONMetricsView } from '@/components/JSONMetricsView';
import { getSelectedStyles } from '../ToolBar';
import { HiOutlineDatabase } from 'react-icons/hi';
import { TbApi } from 'react-icons/tb';
import { TimeRangePick } from '@/components/JSONMetricsView/TimeRangePick';

const Metrics = () => {
  const {
    w3s: { metrics }
  } = useStore();

  metrics.use();

  return (
    <Box w="100%">
      <Flex mb="10px" align="center" bg="#fff" borderRadius="8px">
        <Box flex="1">
          <Text fontSize={'1.25rem'} fontWeight={600}>
            Summary
          </Text>
          <Text color={'#7A7A7A'} fontSize="14px">
            Metrics aggregated across all custom and workers.dev routes invoking this Worker.
          </Text>
        </Box>
        {/* <Flex
          p="6px 20px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          boxSize="border-box"
          borderRadius={'8px'}
          {...getSelectedStyles(metrics.showContent === 'API')}
          onClick={(e) => {
            metrics.showContent = 'API';
          }}
        >
          <Icon as={TbApi} boxSize={6} />
          <Box ml="15px" fontSize="14px">
            API
          </Box>
        </Flex>
        <Flex
          ml="10px"
          p="6px 20px"
          alignItems="center"
          cursor="pointer"
          boxSize="border-box"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius={'8px'}
          {...getSelectedStyles(metrics.showContent === 'DATABASE')}
          onClick={(e) => {
            metrics.dbState.call();
            metrics.showContent = 'DATABASE';
          }}
        >
          <Icon as={HiOutlineDatabase} boxSize={6} />
          <Box ml="15px" fontSize="14px">
            Database
          </Box>
        </Flex> */}
      </Flex>
      <Box mb="10px">
        <TimeRangePick {...metrics.timeRangePick.data} />
      </Box>
      <JSONMetricsView data={metrics.metricsData} />
    </Box>
  );
};

export default observer(Metrics);

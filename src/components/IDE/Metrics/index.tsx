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
      </Flex>
      <IframeResizer></IframeResizer>
      <iframe
        src={`${process.env.NEXT_PUBLIC_DEPIN_SCAN_URL}/widget/metrics/eth_0x4f2f741648699c1dc0ad8352e937057cd7e66bd7_pebble_standard_metrics?coin=IOTX`}
        style={{ width: "100%", height: '113vh' }}></iframe>
      {/* <Box mb="10px">
        <TimeRangePick {...metrics.timeRangePick.data} />
      </Box> */}
      <JSONMetricsView data={metrics.metricsData} />
    </Box>
  );
};

export default observer(Metrics);

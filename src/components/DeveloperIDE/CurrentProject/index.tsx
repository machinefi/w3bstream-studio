import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import ToolBar from '../ToolBar';
import { JSONMetricsView } from '@/components/JSONMetricsView';

const CurrentProject = observer(() => {
  const { w3s } = useStore();

  return (
    <Flex w="100%" h="calc(100vh - 100px)">
      <ToolBar borderRadius="8px" overflowY="auto" />
      <Box ml="20px" w="100%" h="100%" p="40px 30px" bg="#fff" borderRadius="8px">
        {w3s.showContent === 'METRICS' && <JSONMetricsView data={w3s.metrics.metricsData} />}
      </Box>
    </Flex>
  );
});

export default CurrentProject;

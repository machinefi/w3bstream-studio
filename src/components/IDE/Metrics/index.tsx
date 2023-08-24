import React from 'react';
import { Flex, Box, Icon, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { JSONMetricsView } from '@/components/JSONMetricsView';
import Link from 'next/link';

const Metrics = () => {
  const {
    w3s,
    w3s: { metrics, project }
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
            metrics aggregated from  <Link style={{ fontSize: "14px", color: "#855eff" }} href={`${w3s.env.envs?.value?.depinScanURL}`}>[DePIN scan]</Link>
          </Text>

        </Box>
      </Flex>
      <Box mt={2}>
        <JSONMetricsView data={metrics.metricsData} />
      </Box>
      <Box style={{ marginLeft: '-10px', marginRight: "-10px" }}>

        <iframe
          src={`${w3s.env.envs?.value?.depinScanURL}/widget/metrics/${project.curProject.f_name}?coin=IOTX`}
          style={{ width: "100%", minHeight: '1100px' }}></iframe>
      </Box>
    </Box>
  );
};

export default observer(Metrics);

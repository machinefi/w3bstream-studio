import { Box, Card, CardBody, CardHeader, Heading, Stack, Flex, Text } from '@chakra-ui/react';
import { SiSimpleanalytics } from 'react-icons/si';
import { AreaChart, ValueFormatter } from '@tremor/react';

export interface LineChartCard {
  title: string;
  description?: string;
  categories: string[];
  data: {
    date?: string;
    [key: string]: any;
  }[];
  valueFormatter: ValueFormatter;
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
  };
}

export const LineChartCard = ({ title, description, data, categories = ['value'], valueFormatter = (number) => `${number}`, config = {} }: LineChartCard) => {
  const { containerWidth = '100%', containerHeight = 300 } = config;

  return (
    <Card>
      <CardHeader>
        <Flex alignItems={'center'}>
          <Text size="md" fontWeight="500" fontSize="16px">
            {title}
          </Text>
        </Flex>
        {description && (
          <Text color="#7a7a7a" fontSize={'12px'}>
            {description}
          </Text>
        )}
      </CardHeader>
      <CardBody pt="0">
        {data.length > 0 ? (
          <Box w={containerWidth} h={containerHeight}>
            <AreaChart className="h-72 mt-4" data={data} index="date" categories={Object.keys(data[0]).filter((i) => i != 'date')} colors={['indigo', 'cyan']} valueFormatter={valueFormatter} />
          </Box>
        ) : (
          <Stack minH="100px" align="center" justify="center">
            <SiSimpleanalytics />
            <Box fontSize={'14px'}>No data to show</Box>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};

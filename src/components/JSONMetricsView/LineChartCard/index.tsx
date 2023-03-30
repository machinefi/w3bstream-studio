import { Box, Card, CardBody, CardHeader, Heading, Select, Stack, Flex } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SiSimpleanalytics } from 'react-icons/si';

export interface LineChartCard {
  title: string;
  tips?: string;
  data: { name: string; value: number; extraData?: { [key: string]: any } }[];
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
    lineColor?: string;
    lineWidth?: number;
    lineType?: 'monotone' | 'natural' | 'basis' | 'linear';
    dotColor?: string;
  };
}

export const LineChartCard = ({ title, tips, data, config = {} }: LineChartCard) => {
  const { containerWidth = '100%', containerHeight = 200, lineColor = '#946FFF', lineWidth = 2, lineType = 'monotone', dotColor = '#946FFF' } = config;

  return (
    <Card>
      <CardHeader>
        <Flex alignItems={'center'}>
          <Heading size="md">{title}</Heading>
        
        </Flex>
      </CardHeader>
      <CardBody pt="0">
        {tips && (
          <Box fontWeight={700} mb="10px">
            {tips}
          </Box>
        )}
        {data.length > 0 ? (
          <ResponsiveContainer width={containerWidth} height={containerHeight}>
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid />
              <Tooltip
                labelFormatter={(index) => index}
                // formatter={(value, name) => {
                //   const cur = data.find((item) => item[0] === name);
                //   return value;
                // }}
              />
              <Line type={lineType} dataKey="value" stroke={lineColor} dot={{ fill: dotColor }} strokeWidth={lineWidth} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Stack align="center">
            <SiSimpleanalytics />
            <Box>No data to show</Box>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};

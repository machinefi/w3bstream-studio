import { Box, Card, CardBody, CardHeader, Heading, Stack } from '@chakra-ui/react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SiSimpleanalytics } from 'react-icons/si';

export interface BarChartCard {
  title: string;
  tips?: string;
  data: { name: string; value: number }[];
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
    barWidth?: number;
    barHeight?: number;
  };
}

export const BarChartCard = ({ title, tips, data, config = {} }: BarChartCard) => {
  const { containerWidth = '100%', containerHeight = 200, barWidth = 150, barHeight = 40 } = config;
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody pt="0">
        {tips && (
          <Box fontWeight={700} mb="10px">
            {tips}
          </Box>
        )}
        {data.length > 0 ? (
          <ResponsiveContainer width={containerWidth} height={containerHeight}>
            <BarChart width={barWidth} height={barHeight} data={data}>
              <XAxis dataKey="name" />
              {/* <YAxis /> */}
              {/* <Tooltip /> */}
              {/* <Legend /> */}
              <Bar dataKey="value" onClick={(data, index) => {}}>
                {data.map((entry, index) => (
                  <Cell cursor="pointer" fill="#946FFF" key={`cell-${index}`} />
                ))}
              </Bar>
            </BarChart>
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

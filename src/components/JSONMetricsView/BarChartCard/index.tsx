import { useState } from 'react';
import { Box, Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface BarChartCard {
  title: string;
  tips: string;
  data: { name: string; amount: number }[];
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
    barWidth?: number;
    barHeight?: number;
  };
}

export const BarChartCard = ({ title, tips, data, config = {} }: BarChartCard) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { containerWidth = '100%', containerHeight = 200, barWidth = 150, barHeight = 40 } = config;
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody pt="0">
        <Box fontWeight={700} mb="10px">
          {tips}
        </Box>
        <ResponsiveContainer width={containerWidth} height={containerHeight}>
          <BarChart width={barWidth} height={barHeight} data={data}>
            <XAxis dataKey="name" />
            {/* <YAxis /> */}
            <Tooltip />
            {/* <Legend /> */}
            <Bar
              dataKey="amount"
              onClick={(data, index) => {
                setActiveIndex(index);
              }}
            >
              {data.map((entry, index) => (
                <Cell cursor="pointer" fill={index === activeIndex ? '#8884d8' : '#82ca9d'} key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

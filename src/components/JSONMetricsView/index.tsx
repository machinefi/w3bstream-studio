import { Stack } from '@chakra-ui/react';
import { BarChartCard } from './BarChartCard';
import { ProgressCard } from './ProgressCard';

export interface JSONMetricsView {
  type: 'ProgressCard' | 'BarChartCard';
  data: ProgressCard | BarChartCard;
}

export const JSONMetricsView = ({ data }: { data: JSONMetricsView[] }) => {
  return (
    <Stack spacing={6}>
      {data.map((item) => {
        switch (item.type) {
          case 'ProgressCard':
            return <ProgressCard {...(item.data as ProgressCard)} />;
          case 'BarChartCard':
            return <BarChartCard {...(item.data as BarChartCard)} />;
          default:
            return null;
        }
      })}
    </Stack>
  );
};

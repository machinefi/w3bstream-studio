import { Stack } from '@chakra-ui/react';
import { LineChartCard } from './LineChartCard';
import { ProgressCard } from './ProgressCard';
import { TimeRangePick } from './TimeRangePick';

export interface JSONMetricsView {
  type: 'ProgressCard' | 'LineChartCard' | 'TimeRangePick';
  data: ProgressCard | LineChartCard | TimeRangePick;
}

export const JSONMetricsView = ({ data }: { data: JSONMetricsView[] }) => {
  return (
    <Stack minH="70vh" spacing={6} py="10px">
      {data.map((item) => {
        switch (item.type) {
          case 'ProgressCard':
            return <ProgressCard {...(item.data as ProgressCard)} />;
          case 'LineChartCard':
            return <LineChartCard {...(item.data as LineChartCard)} />;
          case 'TimeRangePick':
            return <TimeRangePick {...(item.data as TimeRangePick)} />;
          default:
            return null;
        }
      })}
    </Stack>
  );
};

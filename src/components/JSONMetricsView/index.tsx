import { eventBus } from '@/lib/event';
import { Select, Stack } from '@chakra-ui/react';
import { BarChartCard } from './BarChartCard';
import { LineChartCard } from './LineChartCard';
import { ProgressCard } from './ProgressCard';

export interface JSONMetricsView {
  type: 'ProgressCard' | 'BarChartCard' | 'LineChartCard';
  data: ProgressCard | BarChartCard | LineChartCard;
}

const TimeRangePick = () => {
  return (
    <Select
      placeholder="Time Range"
      size="sm"
      w="100"
      ml="auto"
      onChange={(e) => {
        const v = e.target.value;
        switch (v) {
          case '1':
            eventBus.emit('metrics.timerange', new Date(new Date().getTime() - 24 * 60 * 60 * 1000), new Date());
            break;
          case '2':
            eventBus.emit('metrics.timerange', new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), new Date());
            break;
          case '3':
            eventBus.emit('metrics.timerange', new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), new Date());
            break;
          default:
            break;
        }
      }}
    >
      <option value="1">One Day</option>
      <option value="2">One Week</option>
      <option value="3">One Month</option>
    </Select>
  );
};

export const JSONMetricsView = ({ data, showContent }: { data: JSONMetricsView[]; showContent?: 'DATABASE' | 'API' }) => {
  return (
    <Stack h="calc(100vh - 100px)" spacing={6} p="10px" overflowY="scroll">
      {showContent == 'API' && <TimeRangePick />}

      {data.map((item) => {
        switch (item.type) {
          case 'ProgressCard':
            return <ProgressCard {...(item.data as ProgressCard)} />;
          case 'BarChartCard':
            return <BarChartCard {...(item.data as BarChartCard)} />;
          case 'LineChartCard':
            return <LineChartCard {...(item.data as LineChartCard)} />;
          default:
            return null;
        }
      })}
    </Stack>
  );
};

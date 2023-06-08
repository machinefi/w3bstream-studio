import { Stack } from '@chakra-ui/react';
import { LineChartCard } from './LineChartCard';
import { ProgressCard } from './ProgressCard';
import { TimeRangePick } from './TimeRangePick';
import { Grid } from '@tremor/react';

export interface JSONMetricsView {
  type: 'ProgressCard' | 'LineChartCard';
  data: ProgressCard | LineChartCard;
}

const components = {
  ProgressCard,
  LineChartCard
};

export const JSONMetricsView = ({ data }: { data: JSONMetricsView[] }) => {
  return (
    <Grid numCols={1} numColsSm={1} numColsLg={2} numColsMd={2} className="gap-2">
      {data.map((item) => {
        let Component = components[item.type];
        //@ts-ignore
        return <Component {...item.data} />;
      })}
    </Grid>
  );
};

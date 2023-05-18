import { Box, Card, CardBody, CardHeader, Heading, Stack, Flex } from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { SiSimpleanalytics } from 'react-icons/si';

export interface LineChartCard {
  title: string;
  description?: string;
  data: {
    id: string;
    data: {
      x: string;
      y: number;
    }[];
  }[],
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
  };
}

export const LineChartCard = ({ title, description, data, config = {} }: LineChartCard) => {
  const { containerWidth = '100%', containerHeight = 400 } = config;

  return (
    <Card>
      <CardHeader>
        <Flex alignItems={'center'}>
          <Heading size="md">{title}</Heading>
        </Flex>
        {description && (
          <Box>
            {description}
          </Box>
        )}
      </CardHeader>
      <CardBody pt="0" >
        {data[0]?.data.length > 0 ? (
          <Box w={containerWidth} h={containerHeight} >
            <ResponsiveLine
              data={data}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: true,
                reverse: false
              }}
              yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'transportation',
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'count',
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemBackground: 'rgba(0, 0, 0, .03)',
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
            />
          </Box>
        ) : (
          <Stack minH="100px" align="center" justify="center">
            <SiSimpleanalytics />
            <Box>No data to show</Box>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};

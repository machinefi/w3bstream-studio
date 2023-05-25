import { Box, Card, CardBody, CardHeader, Heading, Stack, Flex, Text } from '@chakra-ui/react';
import { SiSimpleanalytics } from 'react-icons/si';
import dynamic from 'next/dynamic';
import { DatumValue } from '@nivo/line';
import { ValueFormat } from '@nivo/core';
import { ScaleSpec } from '@nivo/scales';
import { AxisProps } from '@nivo/axes';

const ResponsiveLine = dynamic(() => import('@nivo/line').then((m) => m.ResponsiveLine), { ssr: false });

export interface LineChartCard {
  title: string;
  description?: string;
  data: {
    id: string | number;
    data: {
      x: string;
      y: number;
    }[];
  }[];
  xFormat?: ValueFormat<DatumValue>;
  yFormat?: ValueFormat<DatumValue>;
  xScale?: ScaleSpec;
  yScale?: ScaleSpec;
  axisTop?: AxisProps<any>;
  axisRight?: AxisProps<any>;
  axisBottom?: AxisProps<any>;
  axisLeft?: AxisProps<any>;
  config?: {
    containerWidth?: string | number;
    containerHeight?: string | number;
  };
}

export const LineChartCard = ({
  title,
  description,
  data,
  config = {},
  xFormat,
  yFormat,
  xScale = {
    type: 'point'
  },
  yScale = {
    type: 'linear',
    min: 'auto',
    max: 'auto',
    stacked: true,
    reverse: false,
    nice: true
  },
  axisTop = null,
  axisRight = null,
  axisBottom = {
    tickSize: 10,
    tickPadding: 5,
    tickRotation: 0,
    legend: 'transportation',
    legendOffset: 36,
    legendPosition: 'middle'
  },
  axisLeft = {
    tickSize: 5,
    tickPadding: 10,
    tickRotation: 0,
    legend: '',
    legendOffset: -40,
    legendPosition: 'middle',
  }
}: LineChartCard) => {
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
        {data[0]?.data.length > 0 ? (
          <Box w={containerWidth} h={containerHeight}>
            <ResponsiveLine
              // @ts-ignore
              data={data}
              margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
              xFormat={xFormat}
              yFormat={yFormat}
              xScale={xScale}
              yScale={yScale}
              axisTop={axisTop}
              axisRight={axisRight}
              axisBottom={axisBottom}
              axisLeft={axisLeft}
              pointSize={5}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              enableGridX={false}
              enableGridY={false}
              defs={[
                {
                  colors: [
                    {
                      color: 'inherit',
                      offset: 0
                    },
                    {
                      color: 'inherit',
                      offset: 100,
                      opacity: 0
                    }
                  ],
                  id: 'gradientA',
                  type: 'linearGradient'
                }
              ]}
              enableArea
              fill={[
                {
                  id: 'gradientA',
                  match: '*'
                }
              ]}
              // legends={[
              //   {
              //     anchor: 'bottom-right',
              //     direction: 'column',
              //     justify: false,
              //     translateX: 100,
              //     translateY: 0,
              //     itemsSpacing: 0,
              //     itemDirection: 'left-to-right',
              //     itemWidth: 80,
              //     itemHeight: 20,
              //     itemOpacity: 0.75,
              //     symbolSize: 12,
              //     symbolShape: 'circle',
              //     symbolBorderColor: 'rgba(0, 0, 0, .5)',
              //     effects: [
              //       {
              //         on: 'hover',
              //         style: {
              //           itemBackground: 'rgba(0, 0, 0, .03)',
              //           itemOpacity: 1
              //         }
              //       }
              //     ]
              //   }
              // ]}
            />
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

import { Box, Card, CardBody, CardHeader, Flex, Heading, Progress, ProgressProps, Stack, StackDivider, Text } from '@chakra-ui/react';
import { ProgressBar } from '@tremor/react';

export interface ProgressCard {
  title: string;
  data: { title: string; currentValue: number; total: number; unit: string; progressPros?: ProgressProps }[];
}

export const ProgressCard = ({ title, data }: ProgressCard) => {
  return (
    <Card>
      <CardHeader>
        <Text size="md" fontWeight={600} fontSize={'18px'}>
          {title}
        </Text>
      </CardHeader>
      <CardBody pt="0">
        <Stack divider={<StackDivider />} spacing="4">
          {data.map((item) => {
            const { progressPros = {} } = item;
            const percentageValue = (item.currentValue / item.total) * 100;
            return (
              <Box key={item.title}>
                <Text size="xs" fontSize={'14px'}>
                  {item.title}
                </Text>
                <Box mt="10px">
                  <Flex justify="space-between">
                    <Box fontSize={'12px'}>
                      {item.currentValue}
                      {item.unit}
                    </Box>
                    <Box fontSize={'12px'}>
                      {item.total}
                      {item.unit}
                    </Box>
                  </Flex>
                  {/* <Progress mt="5px" value={item.currentValue} min={0} max={item.total} colorScheme="purple" size="sm" {...progressPros} /> */}
                  <ProgressBar value={percentageValue} color="purple" className="mt-3" />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
};

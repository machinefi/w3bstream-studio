import { Box, Card, CardBody, CardHeader, Flex, Heading, Progress, ProgressProps, Stack, StackDivider, Select } from '@chakra-ui/react';

export interface ProgressCard {
  title: string;
  data: { title: string; currentValue: number; total: number; unit: string; progressPros?: ProgressProps }[];
}

export const ProgressCard = ({ title, data }: ProgressCard) => {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody pt="0">
        <Stack divider={<StackDivider />} spacing="4">
          {data.map((item) => {
            const { progressPros = {} } = item;
            return (
              <Box key={item.title}>
                <Heading size="xs">{item.title}</Heading>
                <Box mt="10px">
                  <Flex justify="space-between">
                    <Box>
                      {item.currentValue}
                      {item.unit}
                    </Box>
                    <Box>
                      {item.total}
                      {item.unit}
                    </Box>
                  </Flex>
                  <Progress mt="5px" value={item.currentValue} min={0} max={item.total} colorScheme="green" size="sm" {...progressPros} />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardBody>
    </Card>
  );
};

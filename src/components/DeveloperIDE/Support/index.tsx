import React from 'react';
import { Flex, Box, Grid, GridItem, Image } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { Center } from '@chakra-ui/layout';

const Support = () => {
  return (
    <Center w="100%" h="calc(100vh - 100px)">
      <Grid templateRows="repeat(2, 1fr)" templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="412px" h="328px" bg="#fff">
          <Flex w="100%" h="100%" flexDir="column" justifyContent="center" alignItems="center">
            <Image src="/images/icons/documentation.svg" />
            <Box mt="32px">Documentation</Box>
          </Flex>
        </GridItem>
        <GridItem w="412px" h="328px" bg="#fff">
          <Flex w="100%" h="100%" flexDir="column" justifyContent="center" alignItems="center">
            <Image src="/images/icons/file-an-issue.svg" />
            <Box mt="32px">File an Issue</Box>
          </Flex>
        </GridItem>
        <GridItem w="412px" h="328px" bg="#fff">
          <Flex w="100%" h="100%" flexDir="column" justifyContent="center" alignItems="center">
            <Image src="/images/icons/apply-for-grant.svg" />
            <Box mt="32px">Apply for grant</Box>
          </Flex>
        </GridItem>
        <GridItem w="412px" h="328px" bg="#fff">
          <Flex w="100%" h="100%" flexDir="column" justifyContent="center" alignItems="center">
            <Image src="/images/icons/about.svg" />
            <Box mt="32px">About</Box>
          </Flex>
        </GridItem>
      </Grid>
    </Center>
  );
};

export default observer(Support);

import React from 'react';
import { Flex, Box, Image, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Link, SimpleGrid } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Center } from '@chakra-ui/layout';

const Tools = () => {
  return (
    <Center w="calc(100vw-40px)" h="calc(100vh - 110px)">
      <Box w="100%" h="100%" flex={1}>
        <iframe src={'https://zk-proof-demo.onrender.com/'}
          title="ZK Proof Demo"
          width="100%"
          height="100%"
        ></iframe>
      </Box>
    </Center>
  );
};

export default observer(Tools);

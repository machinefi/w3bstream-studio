import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { FilesItem } from '@/components/IDE/SideBar/filesItem';
import Editor from '@/components/IDE/Editor';

const Labs = () => {
  return (
    <Flex w="100%" h="calc(100vh - 100px)">
      <Flex minW="220px" h="100%" direction="column" align="center" py="20px" bg="#fff" borderRadius="8px" overflowY="auto">
        <FilesItem />
      </Flex>
      <Box ml="10px" w="100%" h="100%" p="10px" bg="#fff" borderRadius="8px">
        <Editor />
      </Box>
    </Flex>
  );
};

export default observer(Labs);

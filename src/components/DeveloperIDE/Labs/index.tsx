import React, { useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { FilesItem } from '@/components/IDE/SideBar/filesItem';
import Editor from '@/components/IDE/Editor';
import { useStore } from '@/store/index';
import { SqlDB } from '@/server/wasmvm/sqldb';

const Labs = () => {

  return (
    <Flex w="100%" h="calc(100vh - 120px)">
      <Box minW="300px" h="100%" p="20px 10px" bg="#fff" borderRadius="8px" overflowY="auto">
        <FilesItem />
      </Box>
      <Box ml="10px" w="100%" h="100%" p="20px 10px" bg="#fff" borderRadius="8px">
        <Editor />
      </Box>
    </Flex>
  );
};

export default observer(Labs);

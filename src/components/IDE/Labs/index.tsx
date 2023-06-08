import React, { useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { FilesItem } from './filesItem';
import Editor from '../Editor';
import { useStore } from '@/store/index';

export const asc = async () => {
  return await import('assemblyscript/dist/asc');
};

export const faker = async (): Promise<{ faker: any }> => {
  // @ts-ignore
  return await import('@faker-js/faker');
};

const Labs = () => {
  const { w3s } = useStore();
  useEffect(() => {
    w3s.projectManager.init();
  }, []);
  return (
    <Flex w="100%" alignItems={'stretch'} height="calc(100vh - 96px)">
      <Box minW="248px" color={'#fff'} h="100%" bg="#2f3030" p="20px 10px" borderRadius={'8px 0px 0px 8px'} overflowY="auto">
        <FilesItem />
      </Box>
      <Box w="100%" h="100%" bg="#1e1e1e" borderRadius="8px">
        <Editor />
      </Box>
    </Flex>
  );
};

export default observer(Labs);

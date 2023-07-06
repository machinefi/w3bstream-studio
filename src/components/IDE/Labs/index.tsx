import React, { useEffect } from 'react';
import { Flex, Box, Center } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { FilesItem } from './filesItem';
import Editor from '../Editor';
import { useStore } from '@/store/index';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import ErrorBoundary from '@/components/Common/ErrorBoundary';
import { DataErrorFallback } from '../Editor/Fallback/editorFallback';

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
      <ReactSplit initialSizes={[20, 80]} direction={SplitDirection.Horizontal}>
        <Box minW="248px" color={'#fff'} h="100%" bg="#2f3030" p="20px 10px" borderRadius={'8px 0px 0px 8px'} overflowY="auto">
          <ErrorBoundary fallback={<DataErrorFallback />}>
            <FilesItem />
          </ErrorBoundary>
        </Box>
        <Box w="100%" h="100%" bg="#1e1e1e" borderRadius="0 8px 8px 0">
          <ErrorBoundary fallback={<Center>Something went to wrong</Center>}>
            <Editor />
          </ErrorBoundary>
        </Box>
      </ReactSplit>
    </Flex>
  );
};

export default observer(Labs);

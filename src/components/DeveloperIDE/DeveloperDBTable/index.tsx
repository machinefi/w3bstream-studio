import React from 'react';
import { Flex, Box, Image, Tooltip } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { DBTableSideBar } from '@/components/IDE/SideBar';
import DBTable from '@/components/IDE/DBTable';

const DeveloperDBTable = () => {
  const { w3s } = useStore();

  return (
    <Flex pos="relative" w="100%" h="calc(100vh - 140px)">
      <Box w="200px" border="1px solid rgba(230, 230, 230, 0.75)" overflowY="auto">
        <DBTableSideBar />
      </Box>
      <Box ml="20px" flex={1} borderRadius="8px">
        <DBTable />
      </Box>
      {w3s.showContent === 'DB_TABLE' && (
        <Box pos="absolute" right="0px" top="0px">
          <Tooltip label="Query SQL" placement="bottom">
            <Box
              position="relative"
              cursor="pointer"
              onClick={() => {
                w3s.dbTable.setMode('QUERY_SQL');
              }}
            >
              <Image h={10} w={10} src="/images/icons/execute_sql.svg" />
            </Box>
          </Tooltip>
        </Box>
      )}
    </Flex>
  );
};

export default observer(DeveloperDBTable);

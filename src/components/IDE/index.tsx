import React from 'react';
import { Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box } from '@chakra-ui/layout';
import { hideMenu } from 'react-contextmenu';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import { JSONForm } from '../JSONForm';

const IDE = observer(() => {
  const {
    w3s,
    ide,
    ide: { tabIndex }
  } = useStore();

  return (
    <Box overflow="hidden">
      <Flex onClick={hideMenu}>
        <ToolBar w="50px" h="100vh" top="0" left="0" position="fixed" />
        <Box w="300px" h="100vh" top="0" left="50px" position="fixed" overflow="auto">
          {(tabIndex === 0 || tabIndex === 1 || tabIndex === 2) && <SideBar />}
        </Box>
        <Box ml="370px" mt="80px" w="100%">
          {/* {ide.showContent === ide.TABS.PROJECT && <ProjectList />}
          {ide.showContent === ide.TABS.APPLETS && <Applets />}
          {ide.showContent === ide.TABS.INSTANCE && <Instance />} */}
          {!w3s.isLogin && (
            <Box sx={{ width: '300px' }}>
              <JSONForm jsonstate={w3s.login} />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
});

export default IDE;

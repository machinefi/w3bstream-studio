import React from 'react';
import { Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box } from '@chakra-ui/layout';
import { hideMenu } from 'react-contextmenu';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import AppletTable from './AppletTable';
import AllInstances from './AllInstances';
import JSONSchemaModal from '../JSONSchemaModal';
import Editor from './Editor';

const IDE = observer(() => {
  const { w3s } = useStore();

  return (
    <Box overflow="hidden">
      <Flex onClick={hideMenu}>
        <ToolBar w="50px" h="100vh" top="0" left="0" position="fixed" />
        <Box w="300px" h="100vh" top="0" left="50px" position="fixed" overflow="auto">
          <SideBar />
        </Box>
        <Box ml="370px" mt="80px" w="100%">
          {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'ALL_APPLETS') && <AppletTable />}
          {w3s.showContent === 'ALL_INSTANCES' && <AllInstances />}
          {w3s.showContent === 'EDITOR' && <Editor />}
        </Box>
      </Flex>
      <JSONSchemaModal jsonstate={w3s.createProject} />
      <JSONSchemaModal jsonstate={w3s.createApplet} />
      <JSONSchemaModal jsonstate={w3s.updatePassword} />
    </Box>
  );
});

export default IDE;

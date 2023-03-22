import React from 'react';
import { Flex, Image, Text, Box, Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import JSONModal from '../JSONModal';
import Header from './Header';
import ToolBar from './ToolBar';
import { ConfirmModal } from '../Common/Confirm';
import Projects, { Empty } from './Projects';

const DeveloperIDE = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return (
    <Box w="100vw" h="100vh" overflow="hidden" bg="#F8F8FA">
      <Header />
      <Box mt="80px" w="100%" px="30px">
        {w3s.headerTabs === 'PROJECTS' && (
          <>
            {w3s.showContent === 'CURRENT_PROJECT' && (
              <>
                <ToolBar w="50px" h="100vh" pos="fixed" left="0px" top="100px" />
              </>
            )}
            {w3s.showContent === 'ALL_PROJECTS' && <>{w3s.allProjects.value.length ? <Projects /> : <Empty />}</>}
          </>
        )}
        {w3s.headerTabs === 'LABS' && <></>}
        {w3s.headerTabs === 'SUPPORT' && <></>}
      </Box>
      <ConfirmModal {...confirm.confirmProps} openState={confirm} />
      <JSONModal />
    </Box>
  );
});

export default DeveloperIDE;

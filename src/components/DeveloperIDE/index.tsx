import React from 'react';
import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import JSONModal from '../JSONModal';
import Header from './Header';
import { ConfirmModal } from '../Common/Confirm';
import Projects from './Projects';
import CurrentProject from './CurrentProject';

const DeveloperIDE = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return (
    <Box w="100vw" h="100vh" overflow="hidden" bg="#F8F8FA">
      <Header />
      <Box mt="80px" w="100%" px="30px">
        {w3s.headerTabs === 'PROJECTS' && <>{w3s.curProject ? <CurrentProject /> : <Projects />}</>}
        {w3s.headerTabs === 'LABS' && <></>}
        {w3s.headerTabs === 'SUPPORT' && <></>}
      </Box>
      <ConfirmModal {...confirm.confirmProps} openState={confirm} />
      <JSONModal />
    </Box>
  );
});

export default DeveloperIDE;

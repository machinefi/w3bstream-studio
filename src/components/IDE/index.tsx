import React from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import JSONModal from '../JSONModal';
import Header from './Header';
import { ConfirmModal } from '../Common/Confirm';
import PublishEventRequestTemplates from './PublishEventRequestTemplates';

const DynamicCurrentProject = dynamic(() => import('./CurrentProject'), {
  ssr: false
});

const DynamicProjects = dynamic(() => import('./Projects'), {
  ssr: false
});

const DynamicLabs = dynamic(() => import('./Labs'), {
  ssr: false,
  loading: () => <p>Loading</p>
});

const DynamicFlow = dynamic(() => import('./Flow'), {
  ssr: false
});

const DynamicSupport = dynamic(() => import('./Support'), {
  ssr: false
});

const IDE = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return (
    <Box w="100vw" h="100vh" overflow="auto" bg="#F8F8FA" paddingTop={'70px'} boxSizing="border-box">
      <Header />
      <Box w="100%" px="20px" minH="calc(100vh - 70px)">
        {w3s.currentHeaderTab === 'PROJECTS' && <>{w3s.project.allProjects.currentIndex != -1 ? <DynamicCurrentProject /> : <DynamicProjects />}</>}
        {w3s.currentHeaderTab === 'LABS' && <DynamicLabs />}
        {w3s.currentHeaderTab === 'FLOW' && <DynamicFlow />}
        {w3s.currentHeaderTab === 'SUPPORT' && <DynamicSupport />}
      </Box>
      <ConfirmModal {...confirm.confirmProps} openState={confirm} />
      <JSONModal />
      <PublishEventRequestTemplates />
    </Box>
  );
});

export default IDE;

import React from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Header from '@/components/IDE/Header';
import { ConfirmModal } from '@/components/Common/Confirm/ConfirmModal';
import JSONModal from '@/components/JSONModal';
import PublishEventRequestTemplates from '@/components/IDE/PublishEventRequestTemplates';

type IProps = {
  children: React.ReactNode;
};

const AppLayout = observer((props: IProps) => {
  const {
    base: { confirm }
  } = useStore();

  return (
    <Box w="100vw" h="100vh" overflow="auto" bg="#F8F8FA" paddingTop={'70px'} boxSizing="border-box">
      <Header />
      <Box w="100%" px="20px" minH="calc(100vh - 70px)">
        {props.children}
      </Box>
      <ConfirmModal {...confirm.confirmProps} openState={confirm} />
      <JSONModal />
      <PublishEventRequestTemplates />
    </Box>
  );
});

export default AppLayout;

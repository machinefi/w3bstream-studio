import React from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Header from '@/components/IDE/Header';
import { ConfirmModal } from '@/components/Common/Confirm/ConfirmModal';
import JSONModal from '@/components/JSONModal';
import PublishEventRequestTemplates from '@/components/IDE/PublishEventRequestTemplates';

const DynamicSupport = dynamic(() => import('../components/IDE/Support'), {
  ssr: false
});

const Page = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return <DynamicSupport />;
});

export default Page;

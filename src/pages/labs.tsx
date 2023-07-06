import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Header from '@/components/IDE/Header';
import { ConfirmModal } from '@/components/Common/Confirm/ConfirmModal';
import JSONModal from '@/components/JSONModal';
import PublishEventRequestTemplates from '@/components/IDE/PublishEventRequestTemplates';

const DynamicLabs = dynamic(() => import('../components/IDE/Labs'), {
  ssr: false,
  loading: () => <p>Loading</p>
});

const IDE = observer(() => {
  const {
    w3s: { flowModule },
    base: { confirm }
  } = useStore();

  useEffect(() => {
    flowModule.flow.initNodes.call();
  }, []);

  return <DynamicLabs />;
});

export default IDE;

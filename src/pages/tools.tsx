import React from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

const DynamicTools = dynamic(() => import('../components/IDE/Tools'), {
  ssr: false
});

const Page = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return <DynamicTools />;
});

export default Page;

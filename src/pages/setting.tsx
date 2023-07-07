import React from 'react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

const DynamicUserSettings = dynamic(() => import('../components/IDE/UserSettings'), {
  ssr: false
});

const Page = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return <DynamicUserSettings />;
});

export default Page;

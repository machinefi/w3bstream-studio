import React from 'react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

const DynamicCurrentProject = dynamic(() => import('../components/IDE/CurrentProject'), {
  ssr: false
});

const DynamicProjects = dynamic(() => import('../components/IDE/Projects'), {
  ssr: false
});

const Page = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return <>{w3s.project.allProjects.currentIndex != -1 ? <DynamicCurrentProject /> : <DynamicProjects />}</>;
});

export default Page;

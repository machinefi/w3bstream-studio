import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { useRouter } from 'next/router';

const DynamicCurrentProject = dynamic(() => import('../../components/IDE/CurrentProject'), {
  ssr: false
});

const Page = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();
  const router = useRouter();
  useEffect(() => {
    if (router.query.tab) {
      //@ts-ignore
      w3s.showContent = router.query.tab;
    }
  }, [router.query.tab]);

  React.useEffect(() => {
    if (router.query.id) {
      w3s.project.allProjects.call().then((res) => {
        w3s.project.allProjects.onSelect(res?.findIndex((i) => Number(i.f_project_id) == Number(router.query.id)) ?? 0);
      });
      w3s.project.projectDetail.call(Number(router.query.id));
    }
  }, [router.query.id]);

  return (
    <>
      <DynamicCurrentProject />
    </>
  );
});

export default Page;

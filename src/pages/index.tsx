import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import IDE from '@/components/IDE';
import DeveloperIDE from '@/components/DeveloperIDE';

const HomePage = observer(() => {
  const { w3s } = useStore();
  if (w3s.config.form.formData.accountRole === 'DEVELOPER') {
    return <DeveloperIDE />;
  }
  return <IDE />;
});

export default HomePage;

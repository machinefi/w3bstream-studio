import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import IDE from '@/components/IDE';
import DeveloperIDE from '@/components/DeveloperIDE';

const HomePage = observer(() => {
  const {
    w3s: {
      config: {
        form: {
          formData: { accountRole }
        }
      }
    }
  } = useStore();

  if (accountRole === 'DEVELOPER') {
    return <DeveloperIDE />;
  }

  if (accountRole === 'ADMIN') {
    return <IDE />;
  }

  return null;
});

export default HomePage;

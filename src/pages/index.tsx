import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import IDE from '@/components/IDE';
import DeveloperIDE from '@/components/DeveloperIDE';

const HomePage = observer(() => {
  const {
    w3s: {
      flowModule,
      config: {
        form: {
          formData: { accountRole }
        }
      }
    }
  } = useStore();

  useEffect(() => {
    flowModule.flow.initNodes.call();
  }, []);

  if (accountRole === 'DEVELOPER') {
    return <DeveloperIDE />;
  }

  return <IDE />;
});

export default HomePage;

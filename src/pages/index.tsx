import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import IDE from '@/components/IDE';


const HomePage = observer(() => {
  const {
    w3s: {
      flowModule,
    }
  } = useStore();

  useEffect(() => {
    flowModule.flow.initNodes.call();
  }, []);

  return <IDE />;
});

export default HomePage;

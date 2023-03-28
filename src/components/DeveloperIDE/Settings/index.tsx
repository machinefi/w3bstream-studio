import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ProjectEnvs } from '@/components/JSONFormWidgets/ProjectEnvs';

const Settings = () => {
  const {
    w3s: { project }
  } = useStore();

  useEffect(() => {
    project.setMode('edit');
  }, []);

  return (
    <Box w="100%" h="calc(100vh - 140px)">
      <Box mt="20px" w="100%">
        <ProjectEnvs />
      </Box>
    </Box>
  );
};

export default observer(Settings);

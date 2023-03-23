import React, { useEffect } from 'react';
import { Flex, Box, Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ProjectEnvs } from '@/components/JSONFormWidgets/ProjectEnvs';
import { defaultButtonStyle } from '@/lib/theme';

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
        <Flex justifyContent="flex-end">
          <Button
            mt="20px"
            h="32px"
            {...defaultButtonStyle}
            onClick={async (e) => {
              project.saveEnvForDeleveloper();
            }}
          >
            Submit
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default observer(Settings);

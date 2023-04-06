import React, { useEffect } from 'react';
import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ProjectEnvs } from '@/components/JSONFormWidgets/ProjectEnvs';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

const Settings = () => {
  const {
    w3s: { project },
    base: { confirm }
  } = useStore();

  useEffect(() => {
    project.setMode('edit');
  }, []);

  return (
    <Box w="100%" h="calc(100vh - 140px)">
      <Box mt="20px" fontSize="18px" fontWeight={700}>
        General
      </Box>
      <Box mt="10px" w="100%">
        <ProjectEnvs />
      </Box>
      <Box mt="60px" fontSize="18px" fontWeight={700}>
        Danger Zone
      </Box>
      <Stack mt="10px" p="20px" border="1px solid #F9CFCE" borderRadius="8px">
        <Flex justifyContent="space-between" alignItems="center">
          <Stack>
            <Box fontWeight={700}>Delete this project</Box>
            <Box>Once you delete a project, there is no going back. Please be certain.</Box>
          </Stack>
          <Button
            ml="20px"
            {...defaultOutlineButtonStyle}
            onClick={async (e) => {
              confirm.show({
                title: 'Warning',
                description: 'Are you sure you want to delete it?',
                async onOk() {
                  const projectName = project.curProject?.f_name;
                  if (projectName) {
                    try {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/project/${projectName}`
                      });
                      eventBus.emit('project.delete');
                      project.allProjects.onSelect(-1);
                      project.resetSelectedNames();
                    } catch (error) {}
                  }
                }
              });
            }}
          >
            Delete this project
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default observer(Settings);

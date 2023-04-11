import React, { useEffect } from 'react';
import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ProjectEnvs } from '@/components/JSONFormWidgets/ProjectEnvs';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

const Settings = () => {
  const {
    w3s: { project, applet },
    base: { confirm }
  } = useStore();

  const store = useLocalObservable(() => ({
    get wasmName() {
      const applets = applet.allData.find((item) => item.project_name === project.curProject?.f_name);
      return applets?.f_wasm_name;
    },
    get tags() {
      return project.curProject?.f_description.split(',') || [];
    }
  }));

  useEffect(() => {
    project.setMode('edit');
  }, []);

  return (
    <Box w="100%" h="calc(100vh - 140px)">
      <Box mt="20px" fontSize="18px" fontWeight={700}>
        General
      </Box>
      <Box mt="10px" p="20px" border="1px solid #eee" borderRadius="8px">
        <Flex alignItems="center" fontWeight={700} fontSize="16px" color="#0F0F0F">
          <Box>WASM file name:</Box>
          <Box ml="10px" p="8px 10px" border="1px solid #EDEDED" borderRadius="6px">
            {store.wasmName}
          </Box>
        </Flex>
        <Flex mt="20px" alignItems="center" fontWeight={700} fontSize="16px" color="#0F0F0F">
          <Box>Description Tags:</Box>
          <Flex ml="10px" flexWrap="wrap">
            {store.tags.map((tag) => {
              return (
                <Flex key={tag} mb="5px" mr="5px" p="5px 10px" alignItems="center" color="#000" border="1px solid #EDEDED" borderRadius="6px">
                  {tag}
                </Flex>
              );
            })}
          </Flex>
        </Flex>
        <Box mt="30px">
          <ProjectEnvs />
        </Box>
      </Box>
      <Box mt="60px" fontSize="18px" fontWeight={700}>
        Danger Zone
      </Box>
      <Stack mt="10px" p="20px" border="1px solid #F9CFCE" borderRadius="8px">
        <Flex justifyContent="space-between" alignItems="center">
          <Stack>
            <Box fontWeight={700}>Delete this project</Box>
            <Box>Deleting a project is permanent and will erase all database data, triggers, and events routing. Please proceed with caution.</Box>
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

import React, { useEffect } from 'react';
import { Box, Button, Divider, Flex, Icon, Spinner, Stack, Text, Tooltip } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ProjectEnvs } from '@/components/JSONFormWidgets/ProjectEnvs';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { FaFileExport, FaRegQuestionCircle } from 'react-icons/fa';
import { PromiseState } from '@/store/standard/PromiseState';
import { MdEditDocument } from 'react-icons/md';

const Settings = () => {
  const {
    w3s: { project, applet, instances },
    base: { confirm }
  } = useStore();

  const store = useLocalObservable(() => ({
    get curInstance() {
      return instances.table.dataSource.find((item) => item.project_name === project.curProject?.name);
    },
    get tags() {
      if (project.curProject?.f_description) {
        return project.curProject.f_description.split(',');
      }
      return [];
    },
    operateAddress: new PromiseState<() => Promise<any>, string>({
      defaultValue: '',
      function: async () => {
        try {
          const res = await axios.request({
            method: 'get',
            url: `/api/w3bapp/account/operatoraddr`
          });
          return res?.data;
        } catch (error) {
          return '';
        }
      }
    })
  }));

  useEffect(() => {
    project.setMode('edit');
    store.operateAddress.call();
  }, []);

  useEffect(() => {
    if (applet.curApplet) {
      applet.wasmName.call(applet.curApplet.f_resource_id);
    }
  }, [applet.curApplet]);

  const datas = [
    { title: 'Project Name', value: project.curProject?.f_name },
    { title: 'Project ID', value: project.curProject?.f_project_id },
    { title: 'Operator Address', value: store.operateAddress.value, tips: 'The operator account is randomly generated and assigned to your project. It is used by W3bstream to sign transaction is that your applet sends to the blockchain. Please ensure that you fund this address with the tokens required for gas on the destination chain to which you are se nding your transactions.' },
    {
      title: 'WASM file name',
      value: applet.wasmName.value,
      extra: (
        <Button
          ml="10px"
          size="sm"
          {...defaultOutlineButtonStyle}
          onClick={async () => {
            if (applet.curApplet && store.curInstance) {
              await applet.uploadWASM({
                projectName: project.curProject?.name,
                appletName: applet.curApplet.f_name,
                type: 'update',
                formTitle: 'Update WASM'
              });
            }
          }}
        >
          Update WASM
        </Button>
      )
    }
  ];

  return (
    <Box w="100%" minH={'calc(100vh - 158px)'}>
      <Flex justifyContent="space-between">
        <Box flex="1">
          {/* <Text fontSize={'20px'} fontWeight={700}>
            Settings
          </Text> */}
        </Box>
        <Flex alignItems="center">
          <Button
            leftIcon={project.projectInfo.loading.value ? <Spinner size="sm" /> : <Icon as={MdEditDocument} />}
            size="sm"
            {...defaultOutlineButtonStyle}
            onClick={async () => {
              project.editProjectFile();
            }}
          >
            w3bstream.json
          </Button>
          <Button
            ml="20px"
            leftIcon={<Icon as={FaFileExport} />}
            size="sm"
            {...defaultOutlineButtonStyle}
            onClick={() => {
              project.exportProject();
            }}
          >
            Export this project
          </Button>
        </Flex>
      </Flex>
      <Box mt="10px" p="20px" border="1px solid #eee" borderRadius="8px">
        <Text fontSize={'18px'} fontWeight={600}>
          General
        </Text>
        <Divider my="10px" />
        {datas.map((item) => {
          return (
            <Flex alignItems={'center'} mb="20px">
              <Flex fontWeight={'500'} fontSize="14px" alignItems={'center'} color="blackAlpha.900" minWidth={150} textAlign={'left'}>
                <Text>{item.title}</Text>
                {item.tips && <Tooltip label='The operator account is randomly generated and assigned to your project. It is used by W3bstream to sign transaction that your applet sends to the blockchain. Please ensure that you fund this address with the tokens required for gas on the destination chain to which you are sending your transactions.' placement='right'>
                <Box cursor={'pointer'}><FaRegQuestionCircle color='#797878' fontSize={14} style={{margin: 5}} /></Box>
              </Tooltip>}:
              </Flex>
              <Text ml="10px" fontSize={'14px'} color="blackAlpha.700" >
                {item.value}
              </Text>
              {item.extra}
            </Flex>
          );
        })}
      </Box>

      <Box mt="30px" p="20px" border="1px solid #eee" borderRadius="8px">
        <ProjectEnvs />
      </Box>

      <Box mt="60px" fontSize="16px"  fontWeight={700}>
      </Box>
      <Stack mt="10px" p="20px" border="1px solid #F9CFCE" borderRadius="8px">
        <Flex justifyContent="space-between" alignItems="center">
          <Stack>
            <Text fontWeight={600}>Delete this project</Text>
            <Text fontWeight={400} color="#7a7a7a" fontSize={"14px"}>Deleting a project is permanent and will erase all database data, triggers, and events routing. Please proceed with caution.</Text>
          </Stack>
          <Button
            ml="20px"
            size="sm"

            colorScheme='red'
            onClick={async (e) => {
              confirm.show({
                title: 'Warning',
                description: 'Are you sure you want to delete it?',
                async onOk() {
                  const projectName = project.curProject?.name;
                  if (projectName) {
                    try {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/project/x/${projectName}`
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
            <Text>Delete this project</Text>
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default observer(Settings);

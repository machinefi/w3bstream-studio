import React from 'react';
import { Flex, Box, Portal, Stack, Text, FlexProps } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { MdAddBox, MdRefresh } from 'react-icons/md';
import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Menu, MenuItem } from '@/components/Menu';
import { FilesItem } from './filesItem';
import { helper } from '@/lib/helper';
import toast from 'react-hot-toast';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const { w3s } = useStore();

  const showOtherTab = () => {
    switch (w3s.showContent) {
      case 'EDITOR':
        return (
          <>
            <Flex alignItems="center" justifyContent="space-between" p={2} bg="#FAFAFA">
              <Text cursor="pointer">Files</Text>
            </Flex>
            <Stack mt={1} h="calc(100vh - 100px)" overflowY="auto">
              <FilesItem />
            </Stack>
          </>
        );

      default:
        return (
          <>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'ALL_APPLETS')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'ALL_APPLETS';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Applets
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'ALL_INSTANCES')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'ALL_INSTANCES';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Instances
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'ALL_STRATEGIES')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'ALL_STRATEGIES';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Strategies
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'ALL_PUBLISHERS')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'ALL_PUBLISHERS';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Publishers
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'ALL_CONTRACT_LOGS')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'ALL_CONTRACT_LOGS';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Contract Logs
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_TX')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'All_CHAIN_TX';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Chain TX
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              h="60px"
              p={2}
              borderTop="1px solid rgba(0, 0, 0, 0.06)"
              sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_HEIGHT')}
              cursor="pointer"
              onClick={() => {
                w3s.showContent = 'All_CHAIN_HEIGHT';
              }}
            >
              <Text fontSize="16px" fontWeight={700}>
                Chain Height
              </Text>
            </Flex>
          </>
        );
    }
  };
  return (
    <Flex h="100%" direction="column" flexDirection="column" border="1px solid rgba(0, 0, 0, 0.06)" {...props}>
      <Flex alignItems="center" justifyContent="space-between" h="80px" p={2} borderBottom="1px solid rgba(0, 0, 0, 0.06)">
        <Text fontSize="16px" fontWeight={700}>
          W3bstream Studio
        </Text>
        <Flex alignItems="center">
          <Icon
            as={MdAddBox}
            ml={2}
            w="22px"
            h="19px"
            cursor="pointer"
            onClick={(e) => {
              w3s.project.form.uiSchema['ui:submitButtonOptions'].norender = false;
              w3s.project.form.reset();
              w3s.project.modal.set({
                show: true,
                title: 'Create Project'
              });
            }}
          />
          <Icon
            as={MdRefresh}
            ml={2}
            w="22px"
            h="19px"
            cursor="pointer"
            onClick={async () => {
              await w3s.allProjects.call();
              w3s.projectManager.sync();
              toast.success('Reloaded');
            }}
          />
        </Flex>
      </Flex>

      <Box h="350px" overflowY="auto">
        {w3s.allProjects.value.map((i, index) => {
          return <ProjectItem project={i} index={index} />;
        })}
      </Box>

      {showOtherTab()}
    </Flex>
  );
});

const ProjectItem = observer(({ project, index }: { project: Partial<{ f_name: any; f_project_id: any; applets: any }>; index: number }) => {
  const {
    w3s,
    base: { confirm }
  } = useStore();
  return (
    <ContextMenuTrigger id={`ProjectItemContext${project.f_project_id}`} holdToDisplay={-1}>
      <Box
        key={index}
        p={2}
        cursor="pointer"
        sx={getSelectedStyles(w3s.showContent === 'CURRENT_APPLETS' && w3s.curProjectIndex == index)}
        onClick={(e) => {
          w3s.curProjectIndex = index;
          if (w3s.showContent != 'EDITOR' && w3s.showContent != 'CURRENT_APPLETS') {
            w3s.showContent = 'CURRENT_APPLETS';
          }
          console.log(helper.log(w3s.projectManager.curFilesListSchema));
        }}
      >
        <Text lineHeight="28px" fontSize="14px">
          {project.f_name}
        </Text>
      </Box>
      <Portal>
        <ContextMenu id={`ProjectItemContext${project.f_project_id}`}>
          <Menu w="150px" bordered>
            <MenuItem
              //TODO:  please make sure there has two state for create project and project detail
              onItemSelect={() => {
                w3s.curProjectIndex = index;
                w3s.project.form.value.set({
                  name: w3s.curProject.f_name
                });
                w3s.project.form.uiSchema['ui:submitButtonOptions'].norender = true;
                w3s.project.modal.set({
                  show: true,
                  title: 'Project Details'
                });
              }}
            >
              Detail
            </MenuItem>
            <MenuItem
              color="red"
              onItemSelect={() => {
                confirm.show({
                  title: 'Warning',
                  description: 'Are you sure you want to delete it?',
                  async onOk() {
                    await axios.request({
                      method: 'delete',
                      url: `/srv-applet-mgr/v0/project/${project.f_name}`
                    });
                    eventBus.emit('project.delete');
                    toast.success('Deleted successfully');
                  }
                });
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </ContextMenu>
      </Portal>
    </ContextMenuTrigger>
  );
});

function getSelectedStyles(selected: boolean) {
  return selected
    ? {
        color: '#4689F7',
        bg: '#EDF3FA'
      }
    : {
        color: '#283241',
        bg: '#FAFAFA'
      };
}

export default SideBar;

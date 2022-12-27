import React from 'react';
import { Flex, Box, Portal, Stack, Text, FlexProps, useDisclosure, Collapse, Tooltip, Button } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
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
  const projectCollaspeState = useDisclosure({
    defaultIsOpen: true
  });
  const collectionCollaspeState = useDisclosure({
    defaultIsOpen: false
  });
  const monitorCollaspeState = useDisclosure({
    defaultIsOpen: false
  });

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
              h="60px"
              p={2}
              borderBottom="1px solid rgba(0, 0, 0, 0.06)"
              cursor="pointer"
              onClick={() => {
                collectionCollaspeState.onToggle();
              }}
            >
              <Icon as={collectionCollaspeState.isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={8} cursor="pointer" />
              <Text fontSize="16px" fontWeight={700}>
                Collection
              </Text>
            </Flex>
            <Collapse in={collectionCollaspeState.isOpen}>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
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
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
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
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
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
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
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
            </Collapse>

            <Flex
              alignItems="center"
              h="60px"
              p={2}
              cursor="pointer"
              borderBottom="1px solid rgba(0, 0, 0, 0.06)"
              onClick={() => {
                monitorCollaspeState.onToggle();
              }}
            >
              <Icon as={monitorCollaspeState.isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={8} cursor="pointer" />
              <Text fontSize="16px" fontWeight={700}>
                Monitor
              </Text>
            </Flex>
            <Collapse in={monitorCollaspeState.isOpen}>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
                sx={getSelectedStyles(w3s.showContent === 'ALL_CONTRACT_LOGS')}
                cursor="pointer"
                onClick={() => {
                  w3s.showContent = 'ALL_CONTRACT_LOGS';
                }}
              >
                <Text fontSize="16px" fontWeight={700}>
                  Smart Contract Monitor
                </Text>
              </Flex>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
                sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_TX')}
                cursor="pointer"
                onClick={() => {
                  w3s.showContent = 'All_CHAIN_TX';
                }}
              >
                <Text fontSize="16px" fontWeight={700}>
                  Chain Transaction Monitor
                </Text>
              </Flex>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                py="2"
                px="6"
                borderBottom="1px solid rgba(0, 0, 0, 0.06)"
                sx={getSelectedStyles(w3s.showContent === 'All_CHAIN_HEIGHT')}
                cursor="pointer"
                onClick={() => {
                  w3s.showContent = 'All_CHAIN_HEIGHT';
                }}
              >
                <Text fontSize="16px" fontWeight={700}>
                  Chain Height Monitor
                </Text>
              </Flex>
            </Collapse>
          </>
        );
    }
  };
  return (
    <Box h="100%" border="1px solid rgba(0, 0, 0, 0.06)" {...props}>
      <Flex alignItems="center" justifyContent="space-between" h="60px" p={2} borderBottom="1px solid rgba(0, 0, 0, 0.06)">
        <Text fontSize="16px" fontWeight={700}>
          W3bstream Studio
        </Text>
        <Flex alignItems="center">
          <Tooltip hasArrow label="Add Project" placement="bottom">
            <Button
              p={2}
              variant="ghost"
              onClick={(e) => {
                w3s.project.setMode('add');
                w3s.project.modal.set({
                  show: true,
                  title: 'Create Project'
                });
              }}
            >
              <Icon as={MdAddBox} />
            </Button>
          </Tooltip>
          <Tooltip hasArrow label="Reload Project" placement="bottom">
            <Button
              p={2}
              variant="ghost"
              onClick={async () => {
                await w3s.allProjects.call();
                w3s.projectManager.sync();
                toast.success('Reloaded');
              }}
            >
              <Icon as={MdRefresh} />
            </Button>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex
        alignItems="center"
        h="60px"
        p={2}
        borderBottom="1px solid rgba(0, 0, 0, 0.06)"
        cursor="pointer"
        onClick={() => {
          projectCollaspeState.onToggle();
        }}
      >
        <Icon as={projectCollaspeState.isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={8} cursor="pointer" />
        <Text fontSize="16px" fontWeight={700}>
          Projects
        </Text>
      </Flex>
      <Collapse in={projectCollaspeState.isOpen}>
        <Box h="250px" overflowY="auto" borderBottom="1px solid rgba(0, 0, 0, 0.06)">
          {w3s.allProjects.value.map((i, index) => {
            return <ProjectItem project={i} index={index} />;
          })}
        </Box>
      </Collapse>

      {showOtherTab()}
    </Box>
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
        py="2"
        px="6"
        cursor="pointer"
        borderBottom="1px solid rgba(0, 0, 0, 0.06)"
        sx={getSelectedStyles((w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'EDITOR') && w3s.curProjectIndex == index)}
        onClick={(e) => {
          w3s.curProjectIndex = index;
          if (w3s.showContent != 'EDITOR' && w3s.showContent != 'CURRENT_APPLETS') {
            w3s.showContent = 'CURRENT_APPLETS';
          }
          console.log(helper.log(w3s.projectManager.curFilesListSchema));
        }}
      >
        <Text lineHeight="28px" fontSize="14px" fontWeight={700}>
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
                w3s.project.setMode('edit');
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
                      url: `/api/w3bapp/project/${project.f_name}`
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
        color: '#283241'
      };
}

export default SideBar;

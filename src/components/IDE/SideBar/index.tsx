import React from 'react';
import { Flex, Box, Portal, Stack, Text, FlexProps } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { MdAddBox, MdRefresh } from 'react-icons/md';
import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Menu, MenuItem } from '@/components/Menu';

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const { w3s } = useStore();

  return (
    <Flex h="100%" direction="column" flexDirection="column" bg="#FAFAFA" border="1px solid rgba(0, 0, 0, 0.06)" {...props}>
      <Flex alignItems="center" justifyContent="space-between" h="80px" p={2} borderBottom="1px solid rgba(0, 0, 0, 0.06)">
        <Text fontSize="16px" fontWeight={700}>
          Project Management
        </Text>
        <Flex alignItems="center">
          <Icon
            as={MdAddBox}
            ml={2}
            w="22px"
            h="19px"
            cursor="pointer"
            onClick={(e) => {
              w3s.createProject.uiSchema['ui:submitButtonOptions'].norender = false;
              w3s.createProject.reset();
              w3s.createProject.setExtraData({
                modal: {
                  show: true,
                  title: 'Create Project'
                }
              });
            }}
          />
          <Icon as={MdRefresh} ml={2} w="22px" h="19px" cursor="pointer" />
        </Flex>
      </Flex>
      <Box h="350px" overflowY="auto">
        {w3s.allProjects.value.map((i, index) => {
          return <ProjectItem project={i} index={index} />;
        })}
      </Box>
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
    </Flex>
  );
});

const ProjectItem = observer(({ project, index }: { project: Partial<{ f_name: string; f_project_id: string; applets: any }>; index: number }) => {
  const { w3s } = useStore();
  return (
    <ContextMenuTrigger id={`ProjectItemContext${project.f_project_id}`} holdToDisplay={-1}>
      <Box
        key={index}
        p={2}
        cursor="pointer"
        sx={getSelectedStyles(w3s.curProjectIndex == index)}
        onClick={(e) => {
          w3s.curProjectIndex = index;
          w3s.showContent = 'CURRENT_APPLETS';
        }}
      >
        <Text lineHeight="28px" fontSize="14px">
          {project.f_name}
        </Text>
      </Box>
      <Portal>
        <ContextMenu id={`ProjectItemContext${project.f_project_id}`}>
          <Menu bordered>
            <MenuItem
              onItemSelect={() => {
                w3s.curProjectIndex = index;
                w3s.createProject.setData({
                  name: w3s.curProject.f_name
                });
                w3s.createProject.uiSchema['ui:submitButtonOptions'].norender = true;
                w3s.createProject.setExtraData({
                  modal: {
                    show: true,
                    title: 'Project Details'
                  }
                });
              }}
            >
              Detail
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

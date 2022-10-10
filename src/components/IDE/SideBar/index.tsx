import React from 'react';
import { Flex, Box, Portal, useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Text, FlexProps } from '@chakra-ui/react';
import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Menu, MenuItem } from '@/components/Menu';
import { ProjectModal } from './ProjectModal';

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const { w3s, ide } = useStore();
  const bg = useColorModeValue('white', 'dark');
  const borderColor = useColorModeValue('gray.200', 'grey.100');

  return (
    <Flex
      h="100%"
      style={{ height: '100vh', overflowY: 'auto' }}
      direction="column"
      borderWidth="1px"
      borderStyle="solid"
      bg={bg}
      display="flex"
      flexDirection="column"
      borderColor={borderColor}
      {...props}
    >
      <ContextMenuTrigger id="ProjectContext" holdToDisplay={-1}>
        <Accordion defaultIndex={[0]} allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Project Management
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {w3s.allProjects.value.map((i, index) => {
                return <ProjectItem project={i} index={index} />;
              })}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </ContextMenuTrigger>

      <Portal>
        <ContextMenu id="ProjectContext">
          <Menu bordered>
            <MenuItem>
              <Box
                onClick={(e) => {
                  ide.projectModal = {
                    show: true,
                    type: 'add'
                  };
                }}
              >
                Add Project
              </Box>
            </MenuItem>
          </Menu>
        </ContextMenu>
      </Portal>
      <ProjectModal />
    </Flex>
  );
});

const ProjectItem = observer(({ project, index }: { project: Partial<{ f_name: string; f_project_id: string; applets: any }>; index: number }) => {
  const { w3s, ide } = useStore();
  return (
    <ContextMenuTrigger id={`ProjectItemContext${project.f_project_id}`} holdToDisplay={-1}>
      <Box
        key={index}
        sx={{ color: w3s.curProjectIndex == index ? 'black' : '#999', cursor: 'pointer' }}
        onClick={(e) => {
          w3s.curProjectIndex = index;
        }}
      >
        <Text lineHeight={2} fontSize="sm">
          {project.f_name}
        </Text>
      </Box>
      <Portal>
        <ContextMenu id={`ProjectItemContext${project.f_project_id}`}>
          <Menu bordered>
            <MenuItem
              onItemSelect={() => {
                w3s.curProjectIndex = index;
                ide.projectModal = {
                  show: true,
                  type: 'detail'
                };
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

export default SideBar;

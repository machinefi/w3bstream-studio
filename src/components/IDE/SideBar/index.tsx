import React from 'react';
import { Flex, Box, Portal, useColorModeValue, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Text, Button, chakra, FlexProps } from '@chakra-ui/react';
import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Menu, MenuItem } from '@/components/Menu';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';

const STATUS = {
  0: {
    color: '#000',
    text: ''
  },
  1: {
    color: 'green',
    text: 'idle'
  },
  2: {
    color: '#ff9900',
    text: 'running'
  },
  3: {
    color: 'red',
    text: 'stop'
  }
};

interface SideBarProps extends FlexProps {}

const SideBar = observer((props: SideBarProps) => {
  const { w3s } = useStore();
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

      <ContextMenuTrigger id="AppletsContext" holdToDisplay={-1}>
        <Accordion defaultIndex={[0]} allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Applets
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {w3s.curProject?.applets.map((i, index) => {
                return <AppletItem applet={i} index={index} />;
              })}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </ContextMenuTrigger>

      <ContextMenuTrigger id="InstanceContext" holdToDisplay={-1}>
        <Accordion defaultIndex={[0]} allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Instance
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {w3s.curApplet?.instances.map((i, index) => {
                return <InstanceItem instance={i} index={index} />;
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
                  // ide.addProject.toggleOpen(true);
                }}
              >
                Add Project
              </Box>
            </MenuItem>
          </Menu>
        </ContextMenu>
        <ContextMenu id="AppletsContext">
          <Menu bordered>
            <MenuItem>
              <Box
                onClick={(e) => {
                  // ide.addApplet.toggleOpen(true);
                }}
              >
                Add Applet
              </Box>
            </MenuItem>
          </Menu>
        </ContextMenu>

        {/* <AddProjectModal /> */}
        {/* <AddAppletModal /> */}
      </Portal>
    </Flex>
  );
});

const ProjectItem = observer(({ project, index }: { project: Partial<{ f_name: string; f_project_id: string; applets: any }>; index: number }) => {
  const { w3s } = useStore();
  return (
    <ContextMenuTrigger id={`ProjectItemContext${project.f_project_id}`} holdToDisplay={-1}>
      <Box key={index} sx={{ color: w3s.curProjectIndex == index ? 'black' : '#999', cursor: 'pointer' }} onClick={(e) => (w3s.curProjectIndex = index)}>
        <Text lineHeight={2} fontSize="sm">
          {project.f_name}
        </Text>
      </Box>
      <Portal>
        <ContextMenu id={`ProjectItemContext${project.f_project_id}`}>
          <Menu bordered>
            <MenuItem onItemSelect={() => {}}>Detail</MenuItem>
          </Menu>
        </ContextMenu>
      </Portal>
    </ContextMenuTrigger>
  );
});

const AppletItem = observer(({ applet, index }: { applet: Partial<{ f_name: string; f_project_id: string; f_applet_id: string; instances: any }>; index: number }) => {
  const { w3s } = useStore();
  return (
    <ContextMenuTrigger id={`AppletItemContext${applet.f_applet_id}`} holdToDisplay={-1}>
      <Box key={index} sx={{ color: w3s.curAppletIndex == index ? 'black' : '#999', cursor: 'pointer' }} onClick={(e) => (w3s.curAppletIndex = index)}>
        <Text lineHeight={2} fontSize="sm">
          {applet.f_name}
        </Text>
      </Box>
      <Portal>
        <ContextMenu id={`AppletItemContext${applet.f_applet_id}`}>
          <Menu bordered>
            {applet.instances.length > 0 ? (
              <>
                <MenuItem onItemSelect={(e) => w3s.publishEvent.call({ appletID: applet.f_applet_id, projectID: applet.f_project_id })}>Send Event</MenuItem>
                <MenuItem
                  onItemSelect={() => {
                    copy(
                      `curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${applet.f_project_id}/${applet.f_applet_id}/start' --header 'publisher: "admin"' --header 'Content-Type: text/plain' --data-raw 'input event'`
                    );
                    toast.success('Copied');
                  }}
                >
                  Copy
                </MenuItem>
              </>
            ) : (
              <MenuItem
                onItemSelect={() => {
                  if (applet.instances.length === 0) {
                    w3s.deployApplet.call({ appletID: applet.f_applet_id });
                  }
                }}
              >
                Deploy
              </MenuItem>
            )}
          </Menu>
        </ContextMenu>
      </Portal>
    </ContextMenuTrigger>
  );
});

const InstanceItem = observer(({ instance, index }: { instance: { f_instance_id: string; f_state: number }; index: number }) => {
  const { w3s } = useStore();
  return (
    <ContextMenuTrigger id={`InstanceItemContext${instance.f_instance_id}`} holdToDisplay={-1}>
      <Flex key={index} justifyContent="space-between" alignItems="center">
        <Text lineHeight={2} fontSize="sm" cursor="pointer">
          {instanceIdFormat(instance.f_instance_id)}
        </Text>
        <Text fontSize="sm">Status: <chakra.span color={STATUS[instance.f_state].color}>{STATUS[instance.f_state].text}</chakra.span></Text>
      </Flex>
      <Portal>
        <ContextMenu id={`InstanceItemContext${instance.f_instance_id}`}>
          <Menu bordered>
            <MenuItem onItemSelect={(e) => w3s.handleInstance.call({ instaceID: instance.f_instance_id, event: 'START' })}>
              <Button color="green" w="100%">
                Start
              </Button>
            </MenuItem>
            <MenuItem onItemSelect={(e) => w3s.handleInstance.call({ instaceID: instance.f_instance_id, event: 'Restart' })}>
              <Button color="#ff9900" w="100%">
                Restart
              </Button>
            </MenuItem>
            <MenuItem onItemSelect={(e) => w3s.handleInstance.call({ instaceID: instance.f_instance_id, event: 'STOP' })}>
              <Button color="red" w="100%">
                STOP
              </Button>
            </MenuItem>
          </Menu>
        </ContextMenu>
      </Portal>
    </ContextMenuTrigger>
  );
});

export const instanceIdFormat = (instanceId: string) => {
  const len = instanceId.length;
  return `${instanceId.substring(0, 6)}...${instanceId.substring(len - 5, len)}`;
};

export default SideBar;

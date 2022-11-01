import React from 'react';
import { Flex, Image, Text, Box, Button } from '@chakra-ui/react';
import { Center as LayoutCenter } from '@chakra-ui/layout';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { gradientButtonStyle } from '@/lib/theme';
import JSONSchemaModal from '../JSONSchemaModal';
import Header from './Header';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import { CurProjectApplets, AllApplets } from './Applets';
import AllStrategies from './AllStrategies';
import AllPublishers from './AllPublishers';
import Editor from './Editor';
import DockerLogs from './DockerLogs';
import { ConfirmModal } from '../Common/Confirm';
import JSONTable from '../JSONTable';
import AllContractLogs from './AllContractLogs';

const IDE = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return (
    <>
      <Header />
      <ToolBar w="50px" h="100vh" pos="fixed" left="0px" top="0px" />
      <SideBar w="300px" h="100vh" pos="fixed" left="50px" top="0px" />
      <Box ml="350px" mt="60px" w="calc(100vw - 350px)" p="20px">
        {w3s.allProjects.value.length ? (
          <Box w="100%" h="100%">
            {w3s.showContent === 'CURRENT_APPLETS' && <CurProjectApplets />}
            {w3s.showContent === 'ALL_APPLETS' && <AllApplets />}
            {w3s.showContent === 'ALL_INSTANCES' && <JSONTable jsonstate={w3s.instances} />}
            {w3s.showContent === 'ALL_STRATEGIES' && <AllStrategies />}
            {w3s.showContent === 'ALL_PUBLISHERS' && <AllPublishers />}
            {w3s.showContent === 'EDITOR' && <Editor />}
            {w3s.showContent === 'DOCKER_LOGS' && <DockerLogs />}
            {w3s.showContent === 'ALL_CONTRACT_LOGS' && <AllContractLogs />}
          </Box>
        ) : (
          <LayoutCenter w="100%" h="calc(100vh - 100px)">
            <Flex flexDir="column" alignItems="center">
              <Image w="80px" src="/images/empty_box.svg" alt="" />
              <Text mt="16px" fontSize="14px" color="#7A7A7A">
                You haven't created any project.
              </Text>
              <Button
                mt="30px"
                h="32px"
                {...gradientButtonStyle}
                onClick={() => {
                  w3s.createProject.modal.set({
                    show: true
                  });
                }}
              >
                Create a project now
              </Button>
            </Flex>
          </LayoutCenter>
        )}
      </Box>
      <ConfirmModal {...confirm.confirmProps} openState={confirm} />
      <JSONSchemaModal jsonstate={w3s.createProject} />
      <JSONSchemaModal jsonstate={w3s.createApplet} />
      <JSONSchemaModal jsonstate={w3s.publishEvent} />
      <JSONSchemaModal jsonstate={w3s.updatePassword} />
      <JSONSchemaModal jsonstate={w3s.createPublisher} />
      <JSONSchemaModal jsonstate={w3s.postman}>
        <Button
          mt="10px"
          w="100%"
          h="32px"
          onClick={() => {
            w3s.postman.form.reset();
          }}
        >
          Reset
        </Button>
      </JSONSchemaModal>
      <JSONSchemaModal jsonstate={w3s.createStrategy} />
      <JSONSchemaModal jsonstate={w3s.contractLogs} />
    </>
  );
});

export default IDE;

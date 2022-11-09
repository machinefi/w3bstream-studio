import React from 'react';
import { Flex, Image, Text, Box, Button } from '@chakra-ui/react';
import { Center as LayoutCenter } from '@chakra-ui/layout';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { gradientButtonStyle } from '@/lib/theme';
import JSONModal from '../JSONModal';
import Header from './Header';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import Applets from './Applets';
import AllStrategies from './AllStrategies';
import AllPublishers from './AllPublishers';
import Editor from './Editor';
import DockerLogs from './DockerLogs';
import { ConfirmModal } from '../Common/Confirm';
import JSONTable from '../JSONTable';
import AllContractLogs from './AllContractLogs';
import AllChainTx from './AllChainTx';
import AllChainHeight from './AllChainHeight';
import toast from 'react-hot-toast';
import copy from 'copy-to-clipboard';

const IDE = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  return (
    <Box w="100vw" h="100vh" overflow="hidden">
      <Header />
      <ToolBar w="50px" h="100vh" pos="fixed" left="0px" top="0px" />
      <SideBar w="300px" h="100vh" pos="fixed" left="50px" top="0px" />
      <Box ml="350px" mt="60px" w="calc(100vw - 350px)" p="20px">
        {w3s.allProjects.value.length ? (
          <Box w="100%" h="100%">
            {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'ALL_APPLETS') && <Applets />}
            {w3s.showContent === 'ALL_INSTANCES' && <JSONTable jsonstate={w3s.instances} />}
            {w3s.showContent === 'ALL_STRATEGIES' && <AllStrategies />}
            {w3s.showContent === 'ALL_PUBLISHERS' && <AllPublishers />}
            {w3s.showContent === 'EDITOR' && <Editor />}
            {w3s.showContent === 'DOCKER_LOGS' && <DockerLogs />}
            {w3s.showContent === 'ALL_CONTRACT_LOGS' && <AllContractLogs />}
            {w3s.showContent === 'All_CHAIN_TX' && <AllChainTx />}
            {w3s.showContent === 'All_CHAIN_HEIGHT' && <AllChainHeight />}
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
                  w3s.project.modal.set({
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
      <JSONModal jsonstate={w3s.project} />
      <JSONModal jsonstate={w3s.applet} />
      <JSONModal jsonstate={w3s.password} />
      <JSONModal jsonstate={w3s.publisher} />
      <JSONModal jsonstate={w3s.strategy} />
      <JSONModal jsonstate={w3s.contractLogs} />
      <JSONModal jsonstate={w3s.chainTx} />
      <JSONModal jsonstate={w3s.chainHeight} />
      <JSONModal jsonstate={w3s.publishEvent}>
        <Button
          mt="10px"
          w="100%"
          h="32px"
          variant="outline"
          borderColor="#6FB2FF"
          color="#6FB2FF"
          onClick={() => {
            const { projectID, payload } = w3s.publishEvent.form.formData;
            let data: any = { payload: '' };
            try {
              data = JSON.parse(payload);
            } catch (error) {
              data = payload.replace(/\n/g, '').replace(/\t/g, '');
            }
            if (!projectID) {
              toast.error('Please select the project first');
              return;
            }
            const p = w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
            copy(`curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${p?.f_name}' --header 'Content-Type: text/plain' --data-raw '${JSON.stringify(data)}'`);
            toast.success('Copied');
          }}
        >
          Copy Curl
        </Button>
      </JSONModal>
      <JSONModal jsonstate={w3s.postman}>
        <Button
          mt="10px"
          w="100%"
          h="32px"
          onClick={() => {
            w3s.postman.form.reset({ force: true });
          }}
        >
          Reset
        </Button>
      </JSONModal>
    </Box>
  );
});

export default IDE;

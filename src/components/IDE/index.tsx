import React from 'react';
import { Center, Flex, Image, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Box } from '@chakra-ui/layout';
import { hideMenu } from 'react-contextmenu';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import AppletTable from './AppletTable';
import AllInstances from './AllInstances';
import JSONSchemaModal from '../JSONSchemaModal';
import Header from './Header';

const IDE = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Header />
      <Box w="100vw" h="100vh" minW="1440px" bg="linear-gradient(to right, #EBF2FC, #E3DEFC)">
        <Image pos="fixed" top="60px" left="0px" src="/images/bg_left.svg" alt="" />
        <Image pos="fixed" bottom="0px" right="0px" src="/images/bg_right.svg" alt="" />
        <Box pos="relative" m="90px auto" w="1440px" h="500px">
          <Center pos="relative" h="140px" bg="linear-gradient(90deg, #0D0D0D 0%, rgba(13, 13, 13, 0.8) 100%)">
            <Image pos="absolute" top="0px" left="0px" src="/images/bg_ide_head_left.svg" alt="" />
            <Image pos="absolute" top="0px" right="0px" src="/images/bg_ide_head_right.svg" alt="" />
            <Text fontSize="30px" fontWeight={700} color="#fff">
              W3bstream Demo Portal
            </Text>
          </Center>
          <Flex w="100%" h="calc(100vh - 260px)" bg="#fff">
            <ToolBar w="50px" />
            <SideBar w="300px" />
            <Box ml="24px" mt="24px" w="100%" h="100%">
              {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'ALL_APPLETS') && <AppletTable />}
              {w3s.showContent === 'ALL_INSTANCES' && <AllInstances />}
            </Box>
          </Flex>
        </Box>
      </Box>
      <JSONSchemaModal jsonstate={w3s.createProject} />
      <JSONSchemaModal jsonstate={w3s.createApplet} />
      <JSONSchemaModal jsonstate={w3s.publishEvent} />
      <JSONSchemaModal jsonstate={w3s.updatePassword} />
    </>
  );
});

export default IDE;

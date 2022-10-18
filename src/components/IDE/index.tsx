import React from 'react';
import { Flex, Image, Text, Box, Button } from '@chakra-ui/react';
import { Center as LayoutCenter } from '@chakra-ui/layout';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Header from './Header';
import ToolBar from './ToolBar';
import SideBar from './SideBar';
import AllApplets from './AllApplets';
import AllInstances from './AllInstances';
import AllStrategies from './AllStrategies';
import JSONSchemaModal from '../JSONSchemaModal';
import { gradientButtonStyle } from '@/lib/theme';

const IDE = observer(() => {
  const { w3s } = useStore();

  return (
    <>
      <Header />
      <Box w="100vw" h="100vh" minW="1440px" bg="linear-gradient(to right, #EBF2FC, #E3DEFC)" overflow="hidden">
        <Box pos="relative" mt="60px" w="100%" h="calc(100vh - 60px)" bg="#fff">
          {w3s.allProjects.value.length ? (
            <Flex w="100%" h="100%">
              <ToolBar w="50px" />
              <SideBar w="300px" />
              <Box ml="24px" mt="24px" w="100%" h="100%">
                {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'ALL_APPLETS') && <AllApplets />}
                {w3s.showContent === 'ALL_INSTANCES' && <AllInstances />}
                {w3s.showContent === 'ALL_STRATEGIES' && <AllStrategies />}
              </Box>
            </Flex>
          ) : (
            <Flex w="100%" h="100%">
              <LayoutCenter w="100%" h="100%">
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
                      w3s.createProject.extraValue.set({
                        modal: {
                          title: 'Create project',
                          show: true
                        }
                      });
                    }}
                  >
                    Create a project now
                  </Button>
                </Flex>
              </LayoutCenter>
            </Flex>
          )}
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

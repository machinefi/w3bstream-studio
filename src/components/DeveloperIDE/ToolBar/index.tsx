import React from 'react';
import { Flex, BoxProps, Box, Icon, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { BiBarChartSquare } from 'react-icons/bi';
import { TbDeviceDesktop, TbHandClick, TbSettings } from 'react-icons/tb';
import { HiOutlineDatabase } from 'react-icons/hi';
import { AiOutlineFileText } from 'react-icons/ai';
import { ChevronLeftIcon } from '@chakra-ui/icons';

interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const { w3s } = useStore();

  return (
    <Flex minW="200px" h="100%" direction="column" align="center" p="16px" bg="#fff" {...props}>
      <Text mb="20px" fontSize={'24px'} fontWeight={700}>{w3s.project.curProject.f_name}</Text>
      <Flex
        mb="30px"
        alignItems="center"
        color="#7A7A7A"
        fontSize="14px"
        cursor="pointer"
        onClick={() => {
          w3s.project.allProjects.onSelect(-1);
          w3s.project.resetSelectedNames();
        }}
      >
        <ChevronLeftIcon />
        <Box ml="10px">Return to Projects</Box>
      </Flex>
      <Flex
        w="100%"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'METRICS')}
        onClick={(e) => {
          w3s.showContent = 'METRICS';
        }}
      >
        <Icon as={BiBarChartSquare} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Metrics
        </Box>
      </Flex>
      <Flex
        w="100%"
        mt="16px"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'CURRENT_PUBLISHERS')}
        onClick={(e) => {
          w3s.showContent = 'CURRENT_PUBLISHERS';
        }}
      >
        <Icon as={TbDeviceDesktop} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Devices
        </Box>
      </Flex>
      <Flex
        w="100%"
        mt="16px"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'CONTRACT_LOGS' || w3s.showContent === 'CHAIN_TX' || w3s.showContent === 'CHAIN_HEIGHT')}
        onClick={(e) => {
          w3s.showContent = 'CONTRACT_LOGS';
        }}
      >
        <Icon as={TbHandClick} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Triggers
        </Box>
      </Flex>
      <Flex
        w="100%"
        mt="16px"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'DB_TABLE')}
        onClick={(e) => {
          w3s.showContent = 'DB_TABLE';
        }}
      >
        <Icon as={HiOutlineDatabase} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Data
        </Box>
      </Flex>
      <Flex
        w="100%"
        mt="16px"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'CURRENT_EVENT_LOGS')}
        onClick={(e) => {
          w3s.showContent = 'CURRENT_EVENT_LOGS';
        }}
      >
        <Icon as={AiOutlineFileText} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Log
        </Box>
      </Flex>
      <Flex
        w="100%"
        mt="16px"
        p="18px"
        alignItems="center"
        cursor="pointer"
        color="rgba(15, 15, 15, 0.75)"
        borderRadius="8px"
        {...getSelectedStyles(w3s.showContent === 'SETTINGS')}
        onClick={(e) => {
          w3s.showContent = 'SETTINGS';
        }}
      >
        <Icon as={TbSettings} boxSize={6} />
        <Box ml="15px" fontSize="16px">
          Settings
        </Box>
      </Flex>
    </Flex>
  );
};

export function getSelectedStyles(selected: boolean) {
  return selected
    ? {
        sx: {
          background: 'rgba(148, 111, 255, 0.1)',
          '& > svg': {
            color: '#946FFF'
          },
          '& > div': {
            color: '#946FFF'
          }
        }
      }
    : {
        sx: {
          ':hover': {
            '& > svg': {
              color: '#946FFF'
            },
            '& > div': {
              color: '#946FFF'
            },
            background: 'rgba(148, 111, 255, 0.1)'
          }
        }
      };
}

export default observer(ToolBar);

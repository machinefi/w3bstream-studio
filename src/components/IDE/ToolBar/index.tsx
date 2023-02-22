import React from 'react';
import { Flex, BoxProps, Image, Tooltip, Box } from '@chakra-ui/react';
import { useStore } from '@/store/index';

interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const { w3s } = useStore();
  const iconStyle = {
    p: '1',
    h: '8',
    w: '8',
    borderRadius: '4px',
    cursor: 'pointer',
    _hover: { background: 'gray.200', }
  };

  return (
    <Flex h="100%" direction="column" justify="space-between" align="center" py={2} {...props}>
      <Flex direction="column">
        <Image mt="8px" mb="18px" w="30px" src="/favicon.svg" alt="logo" />
        <Tooltip label="Project" placement="right">
          <Image
            src="/images/icons/project.svg"
            onClick={() => {
              w3s.showContent = 'CURRENT_APPLETS';
            }}
            {...iconStyle}
            {...getSelectedStyles(w3s.showContent === 'CURRENT_APPLETS')}
          />
        </Tooltip>

        <Tooltip label="Collection" placement="right">
          <Box position="relative">
            <Image
              mt="10px"
              src="/images/icons/collection.svg"
              onClick={() => {
                w3s.showContent = 'ALL_APPLETS';
              }}
              {...iconStyle}
              {...getSelectedStyles(w3s.showContent === 'ALL_APPLETS' || w3s.showContent === 'ALL_INSTANCES' || w3s.showContent === 'ALL_STRATEGIES' || w3s.showContent === 'ALL_PUBLISHERS')}
            />
          </Box>
        </Tooltip>

        <Tooltip label="Monitor" placement="right">
          <Box position="relative">
            <Image
              mt="10px"
              src="/images/icons/monitor.svg"
              onClick={() => {
                w3s.showContent = 'ALL_CONTRACT_LOGS';
              }}
              {...iconStyle}
              {...getSelectedStyles(w3s.showContent === 'ALL_CONTRACT_LOGS' || w3s.showContent === 'All_CHAIN_TX' || w3s.showContent === 'All_CHAIN_HEIGHT')}
            />
          </Box>
        </Tooltip>

        <Tooltip label="Database Tables" placement="right">
          <Box position="relative">
            <Image
              mt="10px"
              src="/images/icons/table.svg"
              onClick={() => {
                w3s.showContent = 'DB_TABLE';
              }}
              {...iconStyle}
              {...getSelectedStyles(w3s.showContent === 'DB_TABLE')}
            />
          </Box>
        </Tooltip>

        <Tooltip label="Editor" placement="right">
          <Box position="relative" mt="10px">
            <Image
              mt="10px"
              src="/images/icons/code.svg"
              onClick={() => {
                w3s.showContent = 'EDITOR';
              }}
              {...iconStyle}
              {...getSelectedStyles(w3s.showContent === 'EDITOR')}
            />
            <Box fontSize="12px" color="white" bg="black" borderRadius="3px" px={1} position="absolute" right={'-2px'} top={'1px'}>
              Lab
            </Box>
          </Box>
        </Tooltip>

        {process.env.NODE_ENV === 'development' && (
          <Tooltip label="Docker Logs" placement="right">
            <Image
              mt="10px"
              src="/images/icons/docker.svg"
              onClick={() => {
                w3s.showContent = 'DOCKER_LOGS';
              }}
              {...iconStyle}
              {...getSelectedStyles(w3s.showContent === 'DOCKER_LOGS')}
            />
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
};

function getSelectedStyles(selected: boolean) {
  return selected
    ? { background: 'gray.200' }
    : {
        background: 'transparent'
      };
}

export default ToolBar;

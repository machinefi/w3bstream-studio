import React from 'react';
import { Flex, Box, Icon } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { TbHandClick } from 'react-icons/tb';
import ContractLogs from '@/components/IDE/Monitor/ContractLogs';
import ChainTx from '@/components/IDE/Monitor/ChainTx';
import ChainHeight from '@/components/IDE/Monitor/ChainHeight';

const Triggers = () => {
  const { w3s } = useStore();

  return (
    <Box w="100%" h="calc(100vh - 100px)">
      <Flex alignItems="center">
        <Flex
          w="100%"
          p="18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'ALL_CONTRACT_LOGS')}
          onClick={(e) => {
            w3s.showContent = 'ALL_CONTRACT_LOGS';
          }}
        >
          <Icon as={TbHandClick} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            Smart Contract Monitor
          </Box>
        </Flex>
        <Flex
          ml="16px"
          w="100%"
          p="18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'All_CHAIN_TX')}
          onClick={(e) => {
            w3s.showContent = 'All_CHAIN_TX';
          }}
        >
          <Icon as={TbHandClick} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            Chain Transaction Monitor
          </Box>
        </Flex>
        <Flex
          ml="16px"
          w="100%"
          p="18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'All_CHAIN_HEIGHT')}
          onClick={(e) => {
            w3s.showContent = 'All_CHAIN_HEIGHT';
          }}
        >
          <Icon as={TbHandClick} boxSize={6} />
          <Box ml="15px" fontSize="16px">
            Chain Height Monitor
          </Box>
        </Flex>
      </Flex>
      <Box mt="20px" flex={1} borderRadius="8px" overflowX="auto">
        {w3s.showContent === 'ALL_CONTRACT_LOGS' && <ContractLogs />}
        {w3s.showContent === 'All_CHAIN_TX' && <ChainTx />}
        {w3s.showContent === 'All_CHAIN_HEIGHT' && <ChainHeight />}
      </Box>
    </Box>
  );
};

function getSelectedStyles(selected: boolean) {
  return selected
    ? {
        sx: {
          background: '#946FFF',
          '& > svg': {
            color: '#fff'
          },
          '& > div': {
            color: '#fff'
          }
        }
      }
    : {
        sx: {
          background: 'rgba(148, 111, 255, 0.1)',
          '& > svg': {
            color: '#946FFF'
          },
          '& > div': {
            color: '#946FFF'
          },
          ':hover': {
            '& > svg': {
              color: '#fff'
            },
            '& > div': {
              color: '#fff'
            },
            background: '#946FFF'
          }
        }
      };
}

export default observer(Triggers);

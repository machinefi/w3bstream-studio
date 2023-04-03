import React from 'react';
import { Flex, Box, Icon, Tabs, TabList, TabPanels, TabPanel, Tab } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { TbHandClick } from 'react-icons/tb';
import ContractLogs from '@/components/IDE/Monitor/ContractLogs';
import ChainTx from '@/components/IDE/Monitor/ChainTx';
import ChainHeight from '@/components/IDE/Monitor/ChainHeight';
import Strategies from '@/components/IDE/Strategies';

const Triggers = () => {
  const { w3s } = useStore();

  return (
    <Box w="calc(100vw - 300px)" h="calc(100vh - 140px)">
      <Box>
        <Tabs>
          <TabList>
            <Tab _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>Monitor</Tab>
            <Tab ml="100px" _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Event Rounting
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel px="0px">
              <Flex>
                <Box>
                  <Flex
                    p="5px"
                    alignItems="center"
                    cursor="pointer"
                    color="rgba(15, 15, 15, 0.75)"
                    borderRadius="8px"
                    {...getSelectedStyles(w3s.showContent === 'CONTRACT_LOGS')}
                    onClick={(e) => {
                      w3s.showContent = 'CONTRACT_LOGS';
                    }}
                  >
                    <Icon as={TbHandClick} boxSize={6} />
                    <Box ml="15px" fontSize="16px">
                      Smart Contract Monitor
                    </Box>
                  </Flex>
                  <Flex
                    mt="16px"
                    p="5px"
                    alignItems="center"
                    cursor="pointer"
                    color="rgba(15, 15, 15, 0.75)"
                    borderRadius="8px"
                    {...getSelectedStyles(w3s.showContent === 'CHAIN_TX')}
                    onClick={(e) => {
                      w3s.showContent = 'CHAIN_TX';
                    }}
                  >
                    <Icon as={TbHandClick} boxSize={6} />
                    <Box ml="15px" fontSize="16px">
                      Chain Transaction Monitor
                    </Box>
                  </Flex>
                  <Flex
                    mt="16px"
                    p="5px"
                    alignItems="center"
                    cursor="pointer"
                    color="rgba(15, 15, 15, 0.75)"
                    borderRadius="8px"
                    {...getSelectedStyles(w3s.showContent === 'CHAIN_HEIGHT')}
                    onClick={(e) => {
                      w3s.showContent = 'CHAIN_HEIGHT';
                    }}
                  >
                    <Icon as={TbHandClick} boxSize={6} />
                    <Box ml="15px" fontSize="16px">
                      Chain Height Monitor
                    </Box>
                  </Flex>
                </Box>
                <Box ml="20px" w="100%" overflowX="auto">
                  {w3s.showContent === 'CONTRACT_LOGS' && <ContractLogs />}
                  {w3s.showContent === 'CHAIN_TX' && <ChainTx />}
                  {w3s.showContent === 'CHAIN_HEIGHT' && <ChainHeight />}
                </Box>
              </Flex>
            </TabPanel>
            <TabPanel>
              <Strategies />
            </TabPanel>
          </TabPanels>
        </Tabs>
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

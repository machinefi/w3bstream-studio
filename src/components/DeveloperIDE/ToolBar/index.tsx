import React from 'react';
import { Flex, BoxProps, Box, Icon, Text, Popover, PopoverTrigger, PopoverContent, useDisclosure } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { BiBarChartSquare } from 'react-icons/bi';
import { TbDeviceDesktop, TbHandClick, TbSettings } from 'react-icons/tb';
import { HiOutlineDatabase } from 'react-icons/hi';
import { AiOutlineFileText } from 'react-icons/ai';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { INSTANCE_STATUS } from '@/components/JSONTable/FieldRender';
import toast from 'react-hot-toast';

interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const { w3s } = useStore();
  const { onOpen, onClose, isOpen } = useDisclosure();

  const curProjectInstance = w3s.instances.table.dataSource.find((option) => option.project_name === w3s.project.curProject?.name);
  const curProjectStatus = INSTANCE_STATUS[curProjectInstance?.f_state || 0];

  return (
    <Box position={'fixed'} h="100%" overflow={'auto'}>
      <Flex minW="200px" direction="column" align="center" p="14px" bg="#fff" {...props}>
        <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
          <PopoverTrigger >
            <Flex w="168px" cursor={'pointer'} borderRadius={'8px'} px="14px" py="8px" alignItems={'center'} mb="20px" border={'1px solid #EDEDED'}>
              <Box flex="none" mr="8px" w={'6px'} h="6px" borderRadius={'50%'} bg={curProjectStatus?.color}></Box>
              <Text mr="10px" w="130px"  fontSize={"14px"} color={curProjectStatus?.color} whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
                {w3s.project.curProject?.name}
              </Text>
              <ChevronDownIcon fontSize={'24px'} color={'#7A7A7A'} />
            </Flex>
          </PopoverTrigger>
          <PopoverContent
            bg="#F8F8FA"
            w="168px"
            overflow={'auto'}
            px="14px"
            outline={'none'}
            border="none"
            css={{
              '.project-item': {
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}
          >
            {w3s.project.allProjects.value.map((item, index) => {
              const instance = w3s.instances.table.dataSource.find((option) => option.project_name === item.name);
              const status = INSTANCE_STATUS[instance?.f_state || 0];
              return (
                <Flex
                  className="project-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (instance) {
                      w3s.project.allProjects.onSelect(index);
                      w3s.showContent = 'METRICS';
                    } else {
                      toast.error('No instance found, please create one first');
                    }
                    onClose();
                  }}
                  alignItems={'center'}
                  cursor="pointer"
                  borderBottom={'1px solid #EDEDED'}
                  py="8px"
                  fontSize={'14px'}
                  justifyContent="flex-start"
                >
                  <Box flex="none" mr="8px" w={'6px'} h="6px" borderRadius={'50%'} bg={status?.color}></Box>
                  <Text color={w3s.project.curProject.name === item.name ? status?.color : ''}>{item.name}</Text>
                </Flex>
              );
            })}
          </PopoverContent>
        </Popover>
        <Flex
          w="100%"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'METRICS')}
          onClick={(e) => {
            w3s.showContent = 'METRICS';
          }}
        >
          <Icon as={BiBarChartSquare} boxSize={5} />
          <Box ml="15px" fontSize="14px">
            Metrics
          </Box>
        </Flex>
        <Flex
          w="100%"
          mt="14px"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'CURRENT_PUBLISHERS')}
          onClick={(e) => {
            w3s.showContent = 'CURRENT_PUBLISHERS';
          }}
        >
          <Icon as={TbDeviceDesktop} boxSize={5} />
          <Box ml="15px" fontSize="14px">
            Devices
          </Box>
        </Flex>
        <Flex
          w="100%"
          mt="14px"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'CONTRACT_LOGS' || w3s.showContent === 'CHAIN_TX' || w3s.showContent === 'CHAIN_HEIGHT')}
          onClick={(e) => {
            w3s.showContent = 'CONTRACT_LOGS';
          }}
        >
          <Icon as={TbHandClick} boxSize={5} />
          <Box ml="15px" fontSize="16px">
            Events
          </Box>
        </Flex>
        <Flex
          w="100%"
          mt="14px"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'DB_TABLE')}
          onClick={(e) => {
            w3s.showContent = 'DB_TABLE';
          }}
        >
          <Icon as={HiOutlineDatabase} boxSize={5} />
          <Box ml="15px" fontSize="14px">
            Data
          </Box>
        </Flex>
        <Flex
          w="100%"
          mt="14px"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'CURRENT_EVENT_LOGS')}
          onClick={(e) => {
            w3s.showContent = 'CURRENT_EVENT_LOGS';
          }}
        >
          <Icon as={AiOutlineFileText} boxSize={5} />
          <Box ml="15px" fontSize="14px">
            Log
          </Box>
        </Flex>
        <Flex
          w="100%"
          mt="14px"
          p="14px 18px"
          alignItems="center"
          cursor="pointer"
          color="rgba(15, 15, 15, 0.75)"
          borderRadius="8px"
          {...getSelectedStyles(w3s.showContent === 'SETTINGS')}
          onClick={(e) => {
            w3s.showContent = 'SETTINGS';
          }}
        >
          <Icon as={TbSettings} boxSize={5} />
          <Box ml="15px" fontSize="14px">
            Settings
          </Box>
        </Flex>
      </Flex>
    </Box>
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

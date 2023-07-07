import React from 'react';
import { Flex, BoxProps, Box, Icon, Text, Popover, PopoverTrigger, PopoverContent, useDisclosure, Spinner } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { BiBarChartSquare } from 'react-icons/bi';
import { TbDeviceDesktop, TbHandClick, TbSettings } from 'react-icons/tb';
import { HiOutlineDatabase } from 'react-icons/hi';
import { AiOutlineFileText } from 'react-icons/ai';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { INSTANCE_STATUS } from '@/components/JSONTable/FieldRender';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
interface ToolBar extends BoxProps {}

const ToolBar = (props: ToolBar) => {
  const {
    w3s,
    w3s: {
      project: { curProject, allProjects, projectDetail },
      metrics,
      instances
    },
    lang: { t }
  } = useStore();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const router = useRouter();
  const jumpTab = (tab: string) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          tab,
          id: router.query.id
        }
      },
      null,
      { shallow: true }
    );
  };
  const curProjectStatus = INSTANCE_STATUS[instances.curInstance?.f_state || 0];
  return (
    <Box position={'fixed'} h="100%" overflow={'auto'}>
      <Flex minW="200px" h="100%" direction="column" align="center" p="14px" bg="#fff" {...props}>
        <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
          <PopoverTrigger>
            {curProject ? (
              <Flex w="168px" cursor={'pointer'} borderRadius={'10px'} px="14px" py="6px" alignItems={'center'} mb="20px" border={'1px solid #EDEDED'}>
                <Box flex="none" mr="8px" w={'6px'} h="6px" borderRadius={'50%'} bg={curProjectStatus?.color}></Box>
                <Text mr="10px" w="130px" fontSize={'14px'} color={curProjectStatus?.color} whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
                  {projectDetail.loading.value ? <Spinner w="10px" h="10px" /> : curProject?.name}
                </Text>
                <ChevronDownIcon fontSize={'24px'} color={'#7A7A7A'} />
              </Flex>
            ) : (
              <></>
            )}
          </PopoverTrigger>
          <PopoverContent
            bg="#ffffff"
            border="1px solid #EDEDED"
            w="168px"
            overflow={'auto'}
            px="14px"
            outline={'none'}
            css={{
              '.project-item': {
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}
          >
            {allProjects.value.map((item, index) => {
              const instance = item.applets[0]?.instances[0];
              const status = INSTANCE_STATUS[instance?.f_state || 0];
              return (
                <Flex
                  className="project-item"
                  onClick={async (e) => {
                    onClose();
                    e.stopPropagation();
                    if (instance) {
                      router.push(
                        {
                          pathname: router.pathname,
                          query: {
                            tab: 'METRICS',
                            id: item.f_project_id.toString()
                          }
                        },
                        null,
                        { shallow: true }
                      );
                      allProjects.onSelect(index);
                      await projectDetail.call();
                      const now = new Date();
                      now.setMinutes(0);
                      now.setSeconds(0);
                      now.setMilliseconds(0);
                      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                      metrics.activeDevices.call(yesterday, now);
                      metrics.dataMessages.call(yesterday, now);
                      metrics.blockchainTransaction.call(yesterday, now);
                    } else {
                      toast.error(t('error.change.project.msg'));
                    }
                  }}
                  alignItems={'center'}
                  cursor="pointer"
                  borderBottom={'1px solid #EDEDED'}
                  py="8px"
                  fontSize={'14px'}
                  justifyContent="flex-start"
                >
                  <Box flex="none" mr="8px" w={'6px'} h="6px" borderRadius={'50%'} bg={status?.color}></Box>
                  <Text color={curProject?.name === item.name ? status?.color : ''}>{item.name}</Text>
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
          {...getSelectedStyles(router.query.tab === 'METRICS')}
          onClick={(e) => {
            // w3s.showContent = 'METRICS';
            console.log(router);
            jumpTab('METRICS');
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
          {...getSelectedStyles(router.query.tab === 'CURRENT_PUBLISHERS')}
          onClick={(e) => {
            // w3s.showContent = 'CURRENT_PUBLISHERS';
            jumpTab('CURRENT_PUBLISHERS');
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
          {...getSelectedStyles(router.query.tab === 'CONTRACT_LOGS' || router.query.tab === 'CHAIN_TX' || router.query.tab === 'CHAIN_HEIGHT')}
          onClick={(e) => {
            // w3s.showContent = 'CONTRACT_LOGS';
            jumpTab('CONTRACT_LOGS');
          }}
        >
          <Icon as={TbHandClick} boxSize={5} />
          <Box ml="15px" fontSize="14px">
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
          {...getSelectedStyles(router.query.tab === 'DB_TABLE')}
          onClick={(e) => {
            // w3s.showContent = 'DB_TABLE';
            jumpTab('DB_TABLE');
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
          {...getSelectedStyles(router.query.tab === 'CURRENT_EVENT_LOGS')}
          onClick={(e) => {
            // w3s.showContent = 'CURRENT_EVENT_LOGS';
            jumpTab('CURRENT_EVENT_LOGS');
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
          {...getSelectedStyles(router.query.tab === 'SETTINGS')}
          onClick={(e) => {
            // w3s.showContent = 'SETTINGS';
            jumpTab('SETTINGS');
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

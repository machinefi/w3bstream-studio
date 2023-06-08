import React from 'react';
import { Flex, Image, Text, Box, Button, Grid, GridItem, Icon, Checkbox, Spinner } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Center } from '@chakra-ui/layout';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { AiOutlineDelete, AiOutlinePauseCircle, AiOutlinePlayCircle, AiOutlinePlus } from 'react-icons/ai';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import toast from 'react-hot-toast';
import { INSTANCE_STATUS } from '@/components/JSONTable/FieldRender';
import { MdRefresh } from 'react-icons/md';
import { FaFileImport } from 'react-icons/fa';
import { ImArrowUpRight2 } from 'react-icons/im';
import { Card } from '@tremor/react';

const Projects = observer(() => {
  const {
    w3s,
    base: { confirm },
    lang: { t }
  } = useStore();
  const { allProjects, selectedNames, projectDetail } = w3s.project;

  if (allProjects.value.length) {
    return (
      <Box w="100%" h="100%" p="40px 30px" bg="#fff" borderRadius="8px">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex>
            <Button
              size="sm"
              leftIcon={<AiOutlinePlus />}
              {...defaultButtonStyle}
              onClick={() => {
                w3s.project.createProjectForDeveloper.call();
              }}
            >
              Create New Project
            </Button>
            <Button
              ml="20px"
              size="sm"
              leftIcon={w3s.project.importProject.loading.value ? <Spinner size="sm" color="#946FFF" /> : <Icon as={FaFileImport} />}
              {...defaultOutlineButtonStyle}
              onClick={() => {
                w3s.project.importProject.call();
              }}
            >
              Import a project
            </Button>
          </Flex>
          <Flex alignItems="center">
            <Button
              leftIcon={<MdRefresh />}
              size="sm"
              {...defaultOutlineButtonStyle}
              onClick={async () => {
                await allProjects.call();
                w3s.projectManager.sync();
                toast.success(t('success.reloaded.msg'));
              }}
            >
              Refresh
            </Button>
            <Button
              ml="20px"
              leftIcon={<AiOutlineDelete />}
              size="sm"
              {...defaultOutlineButtonStyle}
              isDisabled={!selectedNames.length}
              onClick={(e) => {
                e.stopPropagation();
                confirm.show({
                  title: 'Warning',
                  description: 'Deleting a project is permanent and will erase all database data, triggers, and events routing. Are you sure you want to delete it?',
                  async onOk() {
                    for (const name of selectedNames) {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/project/x/${name}`
                      });
                    }
                    w3s.project.resetSelectedNames();
                    eventBus.emit('project.delete');
                    toast.success(t('success.delete.msg'));
                  }
                });
              }}
            >
              Delete
            </Button>
            <Button
              leftIcon={<AiOutlinePauseCircle />}
              ml="20px"
              size="sm"
              {...defaultOutlineButtonStyle}
              isDisabled={!selectedNames.length}
              onClick={async (e) => {
                e.stopPropagation();
                let err = '';
                for (const name of selectedNames) {
                  const p = allProjects.value.find((item) => item.name === name);
                  const instance = p.applets[0]?.instances[0];
                  if (instance) {
                    try {
                      await axios.request({
                        method: 'put',
                        url: `/api/w3bapp/deploy/${instance.f_instance_id}/HUNGUP`
                      });
                    } catch (error) {
                      err = error.message;
                    }
                  } else {
                    err = t('error.pause.msg');
                  }
                }
                if (err) {
                  toast.error(t('error.pause.msg'));
                } else {
                  w3s.project.resetSelectedNames();
                  eventBus.emit('instance.handle');
                  toast.success(t('success.pause.msg'));
                }
              }}
            >
              Pause
            </Button>
          </Flex>
        </Flex>
        <Grid mt="20px" gridTemplateRows="repeat(6, 1fr)" templateColumns="repeat(2, 1fr)" gap={6} h="calc(100vh - 210px)" overflow="auto">
          {allProjects.value.map((project, index) => {
            const instance = project.applets[0]?.instances[0];
            const status = INSTANCE_STATUS[instance?.f_state || 0];
            return (
              <GridItem
                key={project.name}
                w="100%"
                // p="24px"
                // bg="rgba(248, 248, 250, 0.5)"
                border="1px solid #EDEDED"
                borderRadius="8px"
                cursor="pointer"
                // _hover={{
                //   boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
                // }}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (instance) {
                    w3s.showContent = 'METRICS';
                    allProjects.onSelect(index);
                    projectDetail.call();
                  } else {
                    await w3s.applet.uploadWASM({
                      projectName: project.name,
                      formTitle: 'Upload WASM'
                    });
                  }
                }}
              >
                <Card className="hover:shadow-md flex flex-col justify-between" style={{ minHeight: '145px' }}>
                  <Flex alignItems="center" justifyContent="space-between">
                    <Flex alignItems="center" mr="5px">
                      <Flex fontWeight={600} fontSize="16px" color={'rgba(15, 15, 15, 0.75)'} alignItems={'center'} gap="10px">
                        <Text>{project.name} </Text>
                        <ImArrowUpRight2 fontSize={14} color="#946FFF" />
                      </Flex>

                      {!instance && (
                        <Button
                          ml="20px"
                          h="25px"
                          size="sm"
                          {...defaultButtonStyle}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await w3s.applet.uploadWASM({
                              projectName: project.name,
                              formTitle: 'Upload WASM'
                            });
                          }}
                        >
                          Upload WASM
                        </Button>
                      )}
                    </Flex>

                    <Flex
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        size="md"
                        sx={{
                          '& > .chakra-checkbox__control[data-checked]': {
                            background: '#946FFF',
                            borderColor: '#946FFF',
                            '&:hover': {
                              background: '#946FFF',
                              borderColor: '#946FFF'
                            },
                            '&[data-hover]': {
                              background: '#946FFF',
                              borderColor: '#946FFF'
                            }
                          }
                        }}
                        onChange={(e) => {
                          w3s.project.selectProjectName(project.name, e.target.checked);
                        }}
                      />
                    </Flex>
                  </Flex>

                  {/* <Flex mt="12px" alignItems="center" fontSize="14px">
                  <Icon as={AiOutlineLineChart} color="#7A7A7A" />
                  <Box ml="5px" color="#7A7A7A">
                    Requests per hour:
                  </Box>
                  <Box ml="10px" color="#000">
                    0
                  </Box>
                </Flex> */}
                  <Flex mt="10px" flexWrap="wrap">
                    {project.f_description &&
                      project.f_description.split(',').map((tag) => {
                        return (
                          <Box key={tag} mb="5px" mr="5px" p="5px 10px" alignItems="center" color="#946FFF" fontSize="xs" bg="#F2EEFF" borderRadius="6px">
                            <Text size="xs">{tag}</Text>
                          </Box>
                        );
                      })}
                  </Flex>

                  <Flex mt="10px" justifyContent="space-between">
                    <Flex color={status.color} alignItems="center">
                      <Box w="6px" h="6px" bg={status.color} mr="6px" borderRadius="50%"></Box>{' '}
                      <Text fontWeight={400} fontSize={'12px'}>
                        {status.text}
                      </Text>
                    </Flex>
                    {instance && (
                      <Flex alignItems={'center'}>
                        {instance.f_state === 2 ? (
                          <Flex
                            alignItems={'center'}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.request({
                                  method: 'put',
                                  url: `/api/w3bapp/deploy/${instance.f_instance_id}/HUNGUP`
                                });
                                eventBus.emit('instance.handle');
                                toast.success(t('success.suspended.msg'));
                              } catch (error) {}
                            }}
                          >
                            <Icon ml="20px" as={AiOutlinePauseCircle} boxSize={'1.25rem'} color="#946FFF" cursor="pointer" _hover={{ color: '#7D44FF' }} />
                            <Text ml="10px" fontSize={14} color={'#946FFF'}>
                              Pause
                            </Text>
                          </Flex>
                        ) : (
                          <Flex
                            alignItems={'center'}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axios.request({
                                  method: 'put',
                                  url: `/api/w3bapp/deploy/${instance.f_instance_id}/START`
                                });
                                eventBus.emit('instance.handle');
                                toast.success(t('success.started.msg'));
                              } catch (error) {}
                            }}
                          >
                            <Icon ml="14px" as={AiOutlinePlayCircle} boxSize={'1.25rem'} color="#946FFF" cursor="pointer" _hover={{ color: '#7D44FF' }} />
                            <Text ml="10px" fontSize={14} color={'#946FFF'}>
                              Start
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </Flex>
                </Card>
              </GridItem>
            );
          })}
        </Grid>
      </Box>
    );
  }

  return (
    <Center w="100%" h="100%">
      {allProjects.loading.value ? (
        <Flex h="calc(100vh - 158px)" alignItems={'center'} justifyContent={'center'}>
          <Spinner color="#946FFF" />
        </Flex>
      ) : (
        <Flex flexDir="column" alignItems="center" justifyContent={'center'} h="calc(100vh - 158px)">
          <Image w="80px" src="/images/empty_box.svg" alt="" />
          <Text mt="14px" fontSize="14px" color="#7A7A7A">
            You haven't created any project.
          </Text>
          <Flex mt="30px">
            <Button
              size={'md'}
              {...defaultButtonStyle}
              onClick={() => {
                w3s.project.createProjectForDeveloper.call();
              }}
            >
              Create a project now
            </Button>
            <Button
              ml="20px"
              size={'md'}
              leftIcon={w3s.project.importProject.loading.value ? <Spinner size="sm" color="#946FFF" /> : <Icon as={FaFileImport} />}
              {...defaultOutlineButtonStyle}
              onClick={() => {
                w3s.project.importProject.call();
              }}
            >
              Import a project
            </Button>
          </Flex>
        </Flex>
      )}
    </Center>
  );
});

export default Projects;

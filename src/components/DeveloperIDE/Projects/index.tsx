import React from 'react';
import { Flex, Image, Text, Box, Button, Grid, GridItem, Icon, Tag, Checkbox } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Center } from '@chakra-ui/layout';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { AiOutlineDelete, AiOutlineEdit, AiOutlineLineChart, AiOutlinePauseCircle, AiOutlinePlus } from 'react-icons/ai';
import { BsArrowUpRight } from 'react-icons/bs';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import toast from 'react-hot-toast';

const Projects = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();
  const { allProjects, selectedNames } = w3s.project;

  if (allProjects.value.length) {
    return (
      <Box w="100%" h="calc(100vh - 100px)" p="40px 30px" bg="#fff" borderRadius="8px">
        <Flex justifyContent="space-between" alignItems="center">
          <Button
            leftIcon={<AiOutlinePlus />}
            h="32px"
            {...defaultButtonStyle}
            onClick={() => {
              w3s.project.createProjectForDeleveloper();
            }}
          >
            Create New Project
          </Button>
          <Flex alignItems="center">
            <Button
              leftIcon={<AiOutlineDelete />}
              h="32px"
              {...defaultOutlineButtonStyle}
              isDisabled={!selectedNames.length}
              onClick={(e) => {
                e.stopPropagation();
                confirm.show({
                  title: 'Warning',
                  description: 'Are you sure you want to delete it?',
                  async onOk() {
                    for (const name of selectedNames) {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/project/${name}`
                      });
                    }
                    w3s.project.resetSelectedNames();
                    eventBus.emit('project.delete');
                    toast.success('Deleted successfully');
                  }
                });
              }}
            >
              Delete
            </Button>
            <Button leftIcon={<AiOutlinePauseCircle />} ml="20px" h="32px" {...defaultOutlineButtonStyle} isDisabled={!selectedNames.length}>
              Pause
            </Button>
          </Flex>
        </Flex>
        <Grid mt="20px" gridTemplateRows="repeat(4, 1fr)" templateColumns="repeat(2, 1fr)" gap={6} h="calc(100vh - 210px)" overflow="auto">
          {allProjects.value.map((project, index) => (
            <GridItem
              w="100%"
              p="24px"
              bg="rgba(248, 248, 250, 0.5)"
              borderRadius="8px"
              key={project.f_name}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                allProjects.onSelect(index);
                w3s.showContent = 'METRICS';
              }}
            >
              <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center">
                  <Box fontWeight={700} fontSize="16px">
                    {project.f_name}
                  </Box>
                  <Icon as={BsArrowUpRight} ml="20px" color="#946FFF" />
                  <Tag ml="20px" size="md" variant="subtle" color="#00B87A" borderRadius="4px" fontSize="14px">
                    Active
                  </Tag>
                </Flex>
                <Box
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
                      w3s.project.selectProjectName(project.f_name, e.target.checked);
                    }}
                  />
                </Box>
              </Flex>
              <Flex mt="12px" alignItems="center" fontSize="14px">
                <Icon as={AiOutlineLineChart} color="#7A7A7A" />
                <Box ml="5px" color="#7A7A7A">
                  Requests per hour:
                </Box>
                <Box ml="10px" color="#000">
                  0
                </Box>
              </Flex>
              <Box mt="20px" fontSize="14px" color="#7A7A7A">
                {/* {project.f_description} */}
                {project.f_name}
              </Box>
              <Flex mt="10px" justifyContent="flex-end">
                <Icon
                  as={AiOutlineEdit}
                  boxSize={5}
                  color="#969696"
                  cursor="pointer"
                  _hover={{ color: '#946FFF' }}
                  onClick={(e) => {
                    // e.stopPropagation();
                  }}
                />
                <Icon
                  ml="20px"
                  as={AiOutlineDelete}
                  boxSize={5}
                  color="#969696"
                  cursor="pointer"
                  _hover={{ color: '#946FFF' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirm.show({
                      title: 'Warning',
                      description: 'Are you sure you want to delete it?',
                      async onOk() {
                        await axios.request({
                          method: 'delete',
                          url: `/api/w3bapp/project/${project.f_name}`
                        });
                        eventBus.emit('project.delete');
                        toast.success('Deleted successfully');
                      }
                    });
                  }}
                />
                <Icon
                  ml="20px"
                  as={AiOutlinePauseCircle}
                  boxSize={5}
                  color="#969696"
                  cursor="pointer"
                  _hover={{ color: '#946FFF' }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </Flex>
            </GridItem>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Center w="100%" h="calc(100vh - 100px)">
      <Flex flexDir="column" alignItems="center">
        <Image w="80px" src="/images/empty_box.svg" alt="" />
        <Text mt="16px" fontSize="14px" color="#7A7A7A">
          You haven't created any project.
        </Text>
        <Button
          mt="30px"
          h="32px"
          {...defaultButtonStyle}
          onClick={() => {
            w3s.project.createProject();
          }}
        >
          Create a project now
        </Button>
      </Flex>
    </Center>
  );
});

export default Projects;

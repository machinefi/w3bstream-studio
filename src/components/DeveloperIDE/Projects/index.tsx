import React from 'react';
import { Flex, Image, Text, Box, Button } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Center } from '@chakra-ui/layout';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { AiOutlinePauseCircle } from 'react-icons/ai';

const Projects = observer(() => {
  const { w3s } = useStore();

  return (
    <Box w="100%" h="500px" bg="#fff" p="40px 30px">
      <Flex justifyContent="space-between" alignItems="center">
        <Button leftIcon={<AddIcon />} h="32px" {...defaultButtonStyle}>
          Create New Project
        </Button>
        <Flex alignItems="center">
          <Button leftIcon={<DeleteIcon />} h="32px" {...defaultOutlineButtonStyle}>
            Delete
          </Button>
          <Button leftIcon={<AiOutlinePauseCircle />} ml="20px" h="32px" {...defaultOutlineButtonStyle}>
            Pause
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
});

export const Empty = observer(() => {
  const { w3s } = useStore();
  return (
    <Center w="100%">
      <Flex flexDir="column" alignItems="center">
        <Image w="80px" src="/images/empty_box.svg" alt="" />
        <Text mt="16px" fontSize="14px" color="#7A7A7A">
          You haven't created any project.
        </Text>
        <Button mt="30px" h="32px" onClick={() => {}}>
          Create a project now
        </Button>
      </Flex>
    </Center>
  );
});

export default Projects;

import React from 'react';
import { Flex, Box, Image, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Link, SimpleGrid } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Center } from '@chakra-ui/layout';
import { useStore } from '@/store/index';

const Support = () => {
  const {
    w3s: {
      env: { envs }
    }
  } = useStore();
  const store = useLocalObservable(() => ({
    get studioVersionLink() {
      return `https://github.com/machinefi/w3bstream-studio/releases/tag/v${envs.value?.studioVersion}`
    },
    get w3bstreamVersionGithubLink() {
      const w3bstreamVersion = envs.value?.w3bstreamVersion;
      return `https://github.com/machinefi/w3bstream/releases/tag/${w3bstreamVersion}`
    },
  }));
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Center w="70vw" mx="auto" h="calc(100vh - 110px)">
      <SimpleGrid w="100%" columns={[1, 2, 3]} gap="24px">
        <a href="http://docs.w3bstream.com" target="_blank" rel="noopener noreferrer">
          <Flex
            w="100%"
            h="30vh"
            minH={'140px'}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            bg="#fff"
            _hover={{
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
            }}
          >
            <Image src="/images/icons/documentation.svg" />
            <Box mt="32px">Documentation</Box>
          </Flex>
        </a>
        <a href="https://developers.iotex.io/academy?w3bstream" target="_blank" rel="noopener noreferrer">
          <Flex
            w="100%"
            h="30vh"
            minH={'140px'}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            bg="#fff"
            _hover={{
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
            }}
          >
            <Image boxSize={'70px'} color="#000" src="/images/Turorials.svg" />
            <Box mt="32px">Tutorials</Box>
          </Flex>
        </a>
        <a href="https://github.com/machinefi/w3bstream/discussions" target="_blank" rel="noopener noreferrer">
          <Flex
            w="100%"
            h="30vh"
            minH={'140px'}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            bg="#fff"
            _hover={{
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
            }}
          >
            <Image src="/images/icons/file-an-issue.svg" />
            <Box mt="32px">File an Issue</Box>
          </Flex>
        </a>
        <a href="http://developers.iotex.io/grants" target="_blank" rel="noopener noreferrer">
          <Flex
            w="100%"
            h="30vh"
            minH={'140px'}
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            bg="#fff"
            _hover={{
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
            }}
          >
            <Image src="/images/icons/apply-for-grant.svg" />
            <Box mt="32px">Apply for grant</Box>
          </Flex>
        </a>
        <Flex
          w="100%"
          h="30vh"
          minH={'140px'}
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          bg="#fff"
          _hover={{
            boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
          }}
          onClick={onOpen}
        >
          <Image src="/images/icons/about.svg" />
          <Box mt="32px">About</Box>
        </Flex>
      </SimpleGrid>
      <Modal onClose={onClose} isOpen={isOpen} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>W3bstream Devnet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px">
            <Flex alignItems="center" fontSize="14px" fontWeight={700}>
              <Box>Studio Version:</Box>
              <Link ml="10px" href={store.studioVersionLink} color="#946FFF" isExternal >
                {envs.value?.studioVersion}
              </Link>
            </Flex>
            <Flex alignItems="center" fontSize="14px" fontWeight={700}>
              <Box whiteSpace="nowrap">W3bstream Version:</Box>
              {
                store.w3bstreamVersionGithubLink ? (
                  <Link ml="10px" href={store.w3bstreamVersionGithubLink} color="#946FFF" isExternal>
                    {envs.value?.w3bstreamVersion}
                  </Link>
                ) : (
                  <Box ml="10px">{envs.value?.w3bstreamVersion}</Box>
                )
              }
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Center>
  );
};

export default observer(Support);

import React from 'react';
import { Button, Flex, Text, TabList, Tabs, Image, Tab } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Link from 'next/link';
import { defaultButtonStyle } from '@/lib/theme';
import StarCount from '../StarCount';
import { WalletConnectButton } from '@/components/WalletConnectButton';

const getTabIndex = (showContent) => {
  if (showContent === 'PROJECTS') {
    return 0;
  }
  if (showContent === 'LABS') {
    return 1;
  }
  if (showContent === 'SUPPORT') {
    return 2;
  }
  if (showContent === 'FLOW') {
    return 3;
  }
  return 0;
};

const Header = observer(() => {
  const { w3s } = useStore();
  return (
    <Flex
      as="header"
      position="fixed"
      top="0px"
      left="0px"
      zIndex="999"
      alignItems="center"
      px="30px"
      w="100%"
      minH="60px"
      boxShadow="sm"
      css={{
        backdropFilter: 'saturate(180%) blur(5px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <Flex
        alignItems="center"
        onClick={() => {
          w3s.actions.goHome();
        }}
        cursor={'pointer'}
      >
        <Image w="30px" src="/favicon.svg" alt="logo" />
        <Flex ml="10px" fontWeight={600} alignItems="flex-start">
          w3bstream Devnet <Text mt="-2px" ml="2px" fontSize={10} color="#946FFF">{w3s.env.envs?.value?.w3bstreamVersion?.split('@')?.[1]?.split('_')?.[0]}</Text>
        </Flex>
      </Flex>
      <Flex ml="4rem" alignItems="center">
        <Tabs
          variant="unstyled"
          index={getTabIndex(w3s.currentHeaderTab)}
          onChange={(number) => {
            // if (number === 0) {
            //   w3s.currentHeaderTab = 'PROJECTS';
            //   w3s.project.allProjects.onSelect(-1)
            //   w3s.project.resetSelectedNames();
            // }
            if (number === 1) {
              w3s.currentHeaderTab = 'LABS';
            }
            if (number === 2) {
              w3s.currentHeaderTab = 'SUPPORT';
            }
            if (number === 3) {
              w3s.currentHeaderTab = 'FLOW';
            }
          }}
        >
          <TabList >
            <Tab
              onClick={() => {
                w3s.actions.goHome();
              }}
              px="0"
              h="40px"
              fontSize={'14px'}

              _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}
            >
              Projects
            </Tab>
            <Tab px="0" ml="60px" h="40px" fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Labs
            </Tab>
            <Tab px="0" ml="60px" h="40px" fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Support
            </Tab>
            {/* <Tab px="0" ml="60px" h="40px" fontSize="1rem" fontWeight={400} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Flow
            </Tab> */}
          </TabList>
        </Tabs>
      </Flex>
      <Flex flex={{ base: 1, md: 'auto' }} justify="flex-end" alignItems="center">
        {/* <Button
          ml="auto"
          size="md"
          bg="#F3F3F3"
          borderRadius={100}
          onClick={async(e) => {
            await w3s.init();
            toast.success('Refreshed');
          }}
        >
          <MdRefresh />
        </Button> */}
        {/* <ChakraLink href="https://github.com/machinefi/w3bstream-studio" isExternal>
          <Image mr="20px" w="100px" src="https://img.shields.io/github/stars/machinefi/w3bstream-studio.svg?style=social&label=Star&maxAge=2592000" />
        </ChakraLink> */}
        <StarCount />
        <Flex mr="10px">
          <Profile />
        </Flex>
      </Flex>
    </Flex>
  );
});

const accountAddressFormat = (address) => {
  const len = address.length;
  return `${address.substring(0, 10)}...${address.substring(len - 9, len)}`;
};

const Profile = observer(() => {
  const { w3s } = useStore();
  const { accountID } = w3s.config.form.formData;

  if (accountID) {
    return (
      <WalletConnectButton
        customStyle={{
          leftIcon: <Image boxSize="20px" objectFit="cover" src="/images/icons/metamask.svg" alt="MetaMask" />
        }}
      />
    );
  }

  return (
    <Link href="/login">
      <Button h="32px" {...defaultButtonStyle}>
        Login
      </Button>
    </Link>
  );
});

export default Header;

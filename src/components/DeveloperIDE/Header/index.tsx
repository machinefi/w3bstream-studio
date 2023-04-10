import React from 'react';
import { Button, Flex, Text, TabList, Tabs, Image, Tab } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Link from 'next/link';
import { defaultButtonStyle } from '@/lib/theme';
import StarCount from '@/components/IDE/StarCount';
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
      <Flex alignItems="center">
        <Image w="30px" src="/favicon.svg" alt="logo" />
        <Text ml="10px" fontWeight={700}>
          W3bstream studio
        </Text>
      </Flex>
      <Flex ml="100px" alignItems="center">
        <Tabs
          variant="unstyled"
          index={getTabIndex(w3s.headerTabs)}
          onChange={(number) => {
            if (number === 0) {
              w3s.headerTabs = 'PROJECTS';
              w3s.project.resetSelectedNames();
            }
            if (number === 1) {
              w3s.headerTabs = 'LABS';
            }
            if (number === 2) {
              w3s.headerTabs = 'SUPPORT';
            }
          }}
        >
          <TabList>
            <Tab w="80px" h="30px" fontSize="xs" fontWeight={400} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Projects
            </Tab>
            <Tab ml="60px" w="60px" h="30px" fontSize="xs" fontWeight={700} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Labs
            </Tab>
            <Tab ml="60px" w="80px" h="30px" fontSize="xs" fontWeight={700} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              Support
            </Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex flex={{ base: 1, md: 'auto' }} justify="flex-end" alignItems="center">
        {/* <ChakraLink href="https://github.com/machinefi/w3bstream-studio" isExternal>
          <Image mr="20px" w="100px" src="https://img.shields.io/github/stars/machinefi/w3bstream-studio.svg?style=social&label=Star&maxAge=2592000" />
        </ChakraLink> */}
        <StarCount />
        <Profile />
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
    return <WalletConnectButton />;
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

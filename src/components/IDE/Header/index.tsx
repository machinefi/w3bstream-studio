import React, { useEffect } from 'react';
import { Button, Flex, Text, TabList, Tabs, Image, Tab, Box } from '@chakra-ui/react';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Link from 'next/link';
import { defaultButtonStyle } from '@/lib/theme';
import StarCount from '../StarCount';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useRouter } from 'next/router';

const Header = observer(() => {
  const router = useRouter();
  const getTabIndex = (showContent) => {
    switch (router.pathname) {
      case '/':
        return 0;
      case '/labs':
        return 1;
      case '/support':
        return 2;
      case '/tools':
        return 3;
      default:
        return 0;
    }
  };

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
          router.push('/')
          w3s.actions.goHome();
        }}
        cursor={'pointer'}
      >
        <Image w="30px" src="/favicon.svg" alt="logo" />
        <Flex ml="10px" fontWeight={600} alignItems="flex-start">
          w3bstream Devnet{' '}
          <Text mt="-2px" ml="2px" fontSize={10} color="#946FFF">
            {w3s.env.envs?.value?.w3bstreamVersion}
          </Text>
        </Flex>
      </Flex>
      <Flex ml="4rem" alignItems="center">
        <Tabs
          variant="unstyled"
          index={getTabIndex(w3s.currentHeaderTab)}
          onChange={(number) => {
            console.log('number', number, getTabIndex(w3s.currentHeaderTab))
            // if (number === 0) {
            //   w3s.currentHeaderTab = 'PROJECTS';
            //   w3s.project.allProjects.onSelect(-1)
            //   w3s.project.resetSelectedNames();
            // }
            if (number === 1) {
              // w3s.currentHeaderTab = 'LABS';
              // router.push('/labs');
            }
            if (number === 2) {
              // w3s.currentHeaderTab = 'SUPPORT';
              // router.push('/support');
            }
          }}
        >
          <TabList>
            <Tab
              onClick={() => {
                w3s.actions.goHome();
              }}
              px="0"
              h="40px"
              fontSize={'14px'}
              _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}
            >
              <Link href={'/'}>Projects</Link>
            </Tab>
            <Tab px="0" ml="40px" h="40px" fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              <Link href={'/labs'}>Labs</Link>
            </Tab>
            <Tab px="0" ml="40px" h="40px" fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              <Link href={'/support'}>Support</Link>
            </Tab>
            <Tab px="0" ml="40px" h="40px" fontSize={'14px'} _selected={{ color: '#855EFF', fontWeight: 700, borderBottom: '2px solid #855EFF' }}>
              <Link href={'/tools'}>Tools</Link>
            </Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex flex={{ base: 1, md: 'auto' }} justify="flex-end" alignItems="center">
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
  const store = useLocalStore(() => ({
    accountID: null
  }));
  useEffect(() => {
    store.accountID = accountID;
  }, []);

  if (store.accountID) {
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

import React from 'react';
import { Button, Flex, Icon, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Tab, TabList, Tabs } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MdHttp, MdLogout } from 'react-icons/md';
import { useStore } from '@/store/index';
import Link from 'next/link';

const Header = observer(() => {
  const { w3s } = useStore();
  return (
    <Flex
      as="header"
      position="fixed"
      top="0px"
      left="350px"
      zIndex="999"
      alignItems="center"
      px="30px"
      w="calc(100vw - 350px)"
      h="60px"
      boxShadow="sm"
      borderBottom="1px solid rgba(0, 0, 0, 0.1)"
      css={{
        backdropFilter: 'saturate(180%) blur(5px)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'CURRENT_PUBLISHERS') && (
        <Tabs
          variant="unstyled"
          onChange={(number) => {
            if (number === 0) {
              w3s.showContent = 'CURRENT_APPLETS';
            }
            if (number === 1) {
              w3s.showContent = 'CURRENT_PUBLISHERS';
            }
          }}
        >
          <TabList>
            <Tab w="60px" h="30px" borderRadius="md" fontSize="sm" _selected={{ color: 'white', bg: 'green.400' }}>
              Applet
            </Tab>
            <Tab ml="20px" w="80px" h="30px" borderRadius="md" fontSize="sm" _selected={{ color: 'white', bg: 'green.400' }}>
              Publisher
            </Tab>
          </TabList>
        </Tabs>
      )}
      <Flex flex={{ base: 1, md: 'auto' }} justify="flex-end" alignItems="center">
        <Icon
          as={MdHttp}
          mr="20px"
          w="22px"
          h="21px"
          cursor="pointer"
          onClick={() =>
            w3s.postman.modal.set({
              show: true
            })
          }
        />
        <Profile />
      </Flex>
    </Flex>
  );
});

const Profile = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();
  const { accountID } = w3s.config.form.formData;

  if (accountID) {
    return (
      <>
        <Popover isLazy matchWidth={true}>
          <PopoverTrigger>
            <Button bg="rgba(0, 0, 0, 0.03)">accountID: {accountID}</Button>
          </PopoverTrigger>
          <PopoverContent bg="white">
            <PopoverArrow />
            <PopoverBody>
              <Button
                w="full"
                bg="rgba(0, 0, 0, 0.03)"
                onClick={() => {
                  w3s.user.modal.set({ show: true });
                }}
              >
                Update password
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <Icon
          as={MdLogout}
          ml="20px"
          w="22px"
          h="21px"
          cursor="pointer"
          onClick={() => {
            confirm.show({
              title: 'Warning',
              description: 'Are you sure you want to log out?',
              async onOk() {
                w3s.config.logout();
              }
            });
          }}
        />
      </>
    );
  }

  return <Link href="/login">Login</Link>;
});

export default Header;

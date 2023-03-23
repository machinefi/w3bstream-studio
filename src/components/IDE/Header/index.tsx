import React from 'react';
import { Box, Button, Flex, Icon, Tab, TabList, Tabs, Tooltip, Image, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { MdHttp, MdLogout } from 'react-icons/md';
import { useStore } from '@/store/index';
import Link from 'next/link';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { helper } from '@/lib/helper';

const getTabIndex = (showContent) => {
  if (showContent === 'CURRENT_APPLETS') {
    return 0;
  }
  if (showContent === 'CURRENT_PUBLISHERS') {
    return 1;
  }
  if (showContent === 'CURRENT_EVENT_LOGS') {
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
      {(w3s.showContent === 'CURRENT_APPLETS' || w3s.showContent === 'CURRENT_PUBLISHERS' || w3s.showContent === 'CURRENT_EVENT_LOGS') && (
        <Tabs
          variant="unstyled"
          index={getTabIndex(w3s.showContent)}
          onChange={(number) => {
            if (number === 0) {
              w3s.showContent = 'CURRENT_APPLETS';
            }
            if (number === 1) {
              w3s.showContent = 'CURRENT_PUBLISHERS';
            }
            if (number === 2) {
              w3s.showContent = 'CURRENT_EVENT_LOGS';
            }
          }}
          sx={{
            '.chakra-tabs__tablist': {
              border: '1px solid rgba(148, 111, 255, 0.4)',
              borderRadius: '10px'
            }
          }}
        >
          <TabList>
            <Tab w="60px" h="30px" fontSize="xs" fontWeight={700} borderLeftRadius="8px" _selected={{ color: 'white', bg: '#946FFF' }}>
              Applet
            </Tab>
            <Tab w="70px" h="30px" fontSize="xs" fontWeight={700} borderLeft="1px solid rgba(148, 111, 255, 0.4)" borderRight="1px solid rgba(148, 111, 255, 0.4)" _selected={{ color: 'white', bg: '#946FFF' }}>
              Publisher
            </Tab>
            <Tab w="60px" h="30px" fontSize="xs" fontWeight={700} borderRightRadius="8px" _selected={{ color: 'white', bg: '#946FFF' }}>
              Log
            </Tab>
          </TabList>
        </Tabs>
      )}
      {w3s.showContent === 'DB_TABLE' && (
        <Tooltip label="Query SQL" placement="bottom">
          <Box
            position="relative"
            cursor="pointer"
            onClick={() => {
              w3s.dbTable.setMode('QUERY_SQL');
            }}
          >
            <Image p={1} h={10} w={10} borderRadius="4px" _hover={{ background: 'gray.200' }} src="/images/icons/execute_sql.svg" />
          </Box>
        </Tooltip>
      )}
      <Flex flex={{ base: 1, md: 'auto' }} justify="flex-end" alignItems="center">
        <Icon
          as={MdHttp}
          mr="20px"
          w="22px"
          h="21px"
          cursor="pointer"
          onClick={async () => {
            w3s.postman.form.value.set({
              headers: {
                Authorization: `Bearer ${w3s.config.form.formData.token}`
              }
            });
            const formData = await hooks.getFormData({
              title: 'Postman',
              size: '2xl',
              formList: [
                {
                  form: w3s.postman.form
                }
              ],
              children: (
                <Button
                  mt="10px"
                  w="100%"
                  h="32px"
                  onClick={() => {
                    w3s.postman.form.reset({ force: true });
                  }}
                >
                  Reset
                </Button>
              )
            });
            const { url, method, body, protocol, topic } = formData;
            if (protocol === 'http/https' && url) {
              await axios.request({
                url,
                method,
                data: JSON.parse(body)
              });
            }
            if (protocol === 'mqtt' && topic) {
              const message = JSON.parse(formData.message);
              if (message.payload) {
                message.payload = helper.stringToBase64(message.payload);
              }
              await axios.request({
                url: '/api/mqtt',
                method: 'post',
                data: {
                  topic,
                  message
                }
              });
            }
            await showNotification({ message: 'requset succeeded' });
            eventBus.emit('postman.request');
          }}
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
      <Menu>
        <MenuButton>
          <Button bg="rgba(0, 0, 0, 0.03)">accountID: {accountID}</Button>
        </MenuButton>
        <MenuList py={0}>
          <MenuItem
            icon={<EditIcon />}
            onClick={async () => {
              const formData = await hooks.getFormData({
                title: 'Update Password',
                size: 'md',
                formList: [
                  {
                    form: w3s.user.pwdForm
                  }
                ]
              });
              if (formData.password) {
                await axios.request({
                  method: 'put',
                  url: `/api/w3bapp/account/${w3s.config.form.formData.accountID}`,
                  data: formData
                });
                showNotification({ message: 'update password succeeded' });
                eventBus.emit('user.update-pwd');
                w3s.config.logout();
              }
            }}
          >
            Update password
          </MenuItem>
          <MenuItem
            icon={<MdLogout />}
            onClick={() => {
              confirm.show({
                title: 'Warning',
                description: 'Are you sure you want to log out?',
                async onOk() {
                  w3s.config.logout();
                }
              });
            }}
          >
            Log out
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return <Link href="/login">Login</Link>;
});

export default Header;

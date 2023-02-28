import React from 'react';
import { Button, Flex, Icon, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Tab, TabList, Tabs } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { MdHttp, MdLogout } from 'react-icons/md';
import { useStore } from '@/store/index';
import Link from 'next/link';
import { hooks } from '@/lib/hooks';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { helper } from '@/lib/helper';

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

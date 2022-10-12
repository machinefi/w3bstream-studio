import React from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody, Flex, FlexProps } from '@chakra-ui/react';
import Link from 'next/link';
import NextRouter from 'next/router';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';

const Profile = observer(() => {
  const { w3s } = useStore();
  const { accountID } = w3s.config.formData;

  if (accountID) {
    return (
      <Popover isLazy matchWidth={true}>
        <PopoverTrigger>
          <Button>accountID: {accountID}</Button>
        </PopoverTrigger>
        <PopoverContent bg="white">
          <PopoverArrow />
          <PopoverBody>
            <Button
              w="full"
              onClick={() => {
                w3s.updatePassword.setExtraData({
                  modal: {
                    show: true,
                  }
                });
              }}
            >
              Update password
            </Button>
            <Button
              mt={2}
              w="full"
              onClick={() => {
                w3s.config.logout();
              }}
            >
              Log out
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  return <Link href="/login">Login</Link>;
});

const DesktopNav = observer((props: FlexProps) => {
  return (
    <Flex spacing={2} {...props}>
      <Profile />
    </Flex>
  );
});

export default DesktopNav;

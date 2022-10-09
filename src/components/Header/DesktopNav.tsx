import React from 'react';
import { Text, Button, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverBody, Flex, FlexProps } from '@chakra-ui/react';
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
                w3s.config.logout();
              }}
            >
              Sign out
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
});

const DesktopNav = observer((props: FlexProps) => {
  return (
    <Flex spacing={2} {...props}>
      <Profile />
    </Flex>
  );
});

export default DesktopNav;

import { InstanceType, PublisherType } from '@/server/routers/w3bstream';
import { CopyIcon } from '@chakra-ui/icons';
import { Badge, Flex, Text } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';

export const INSTANCE_STATUS = {
  0: {
    colorScheme: 'gray',
    text: 'Not activated',
    color: 'gray'
  },
  1: {
    colorScheme: 'gray',
    text: 'idle',
    color: 'gray'
  },
  2: {
    colorScheme: 'green',
    text: 'running',
    color: '#00B87A',
  },
  3: {
    colorScheme: 'red',
    text: 'stop',
    color: '#00B87A',
  }
};

export const getInstanceButtonStatus = (item: InstanceType) => {
  const state = item.f_state;
  const buttonStatus = {
    startBtn: {
      isDisabled: false
    },
    restartBtn: {
      isDisabled: false
    },
    stopBtn: {
      isDisabled: false
    }
  };
  if (state === 1 || state === 3) {
    buttonStatus.stopBtn.isDisabled = true;
  }
  if (state === 2) {
    buttonStatus.startBtn.isDisabled = true;
  }
  return buttonStatus;
};

export const InstanceStatusRender = (item: InstanceType) => {
  const state = item.f_state;
  return (
    <Badge variant="outline" colorScheme={INSTANCE_STATUS[state].colorScheme}>
      {INSTANCE_STATUS[state].text}
    </Badge>
  );
};

export const tokenFormat = (token) => {
  const len = token.length;
  return `${token.substring(0, 12)}...${token.substring(len - 11, len)}`;
};

export const PublisherTokenRender = (item: PublisherType) => {
  return (
    <Flex alignItems="center">
      <Text>{tokenFormat(item.f_token)}</Text>
      <CopyIcon
        w="20px"
        cursor="pointer"
        onClick={() => {
          copy(item.f_token);
          toast.success('Copied');
        }}
      />
    </Flex>
  );
};

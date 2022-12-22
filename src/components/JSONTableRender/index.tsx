import { InstanceType, PublisherType } from '@/server/routers/w3bstream';
import { CopyIcon } from '@chakra-ui/icons';
import { Badge, Flex, Text } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';

export const INSTANCE_STATUS = {
  0: {
    colorScheme: 'gray',
    text: ''
  },
  1: {
    colorScheme: 'gray',
    text: 'idle'
  },
  2: {
    colorScheme: 'green',
    text: 'running'
  },
  3: {
    colorScheme: 'red',
    text: 'stop'
  }
};

export const InstanceStatusRender = (item: Partial<{ f_state: number }>) => {
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

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Flex } from '@chakra-ui/react';
import { JSONForm } from '@/components/JSONForm';
import { useStore } from '../store';
import { Center } from '@chakra-ui/layout';

const Login = observer(() => {
  const { w3s } = useStore();
  return (
    <Center mt='80px'>
      <Box sx={{ width: '300px' }}>
      <JSONForm jsonstate={w3s.login} />
    </Box>
    </Center>
  );
});

export default Login;

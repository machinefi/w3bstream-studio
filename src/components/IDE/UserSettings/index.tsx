import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import Header from '@/components/IDE/Header';
import { ApiKeys } from './ApiKeys';

const UserSettings = observer(() => {
  const {
    w3s,
    base: { confirm }
  } = useStore();

  useEffect(() => {
    w3s.user.userSetting.call()
  }, []);

  return (
    <Box w="100%" h="100%" p="40px 30px" bg="#fff" borderRadius="8px">
      <Box mt="30px" p="20px" border="1px solid #eee" borderRadius="8px">
        <ApiKeys />
      </Box>
    </Box>
  );
});

export default UserSettings;

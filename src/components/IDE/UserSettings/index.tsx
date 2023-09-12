import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { ApiKeys } from './ApiKeys';
import { Operators } from './Operators';

const UserSettings = observer(() => {
  const { w3s } = useStore();

  useEffect(() => {
    w3s.user.userSetting.call();
  }, []);

  return (
    <Box w="100%" h="100%" p="40px 30px" bg="#fff" borderRadius="8px">
      <Box mt="30px" p="20px" border="1px solid #eee" borderRadius="8px">
        <ApiKeys />
      </Box>
      <Box mt="30px" p="20px" border="1px solid #eee" borderRadius="8px">
        <Operators />
      </Box>
    </Box>
  );
});

export default UserSettings;

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { Center } from '@chakra-ui/layout';
import { JSONForm } from '@/components/JSONForm';
import { useStore } from '../store';

const Login = observer(() => {
  const { w3s } = useStore();
  return (
    <Box w="100vw" h="100vh" minW="1440px" bg="linear-gradient(to right, #EBF2FC, #E3DEFC)">
      <Image w="100px" pos="fixed" top="70px" left="100px" src="/images/logo.svg" alt="logo" />
      <Image pos="fixed" top="0px" left="52%" src="/images/polygon_1.svg" alt="" />
      <Image pos="fixed" bottom="0px" right="0px" src="/images/polygon_3.svg" alt="" />
      <Center h="100%" p="20px">
        <Flex>
          <Box>
            <Text fontSize="30px" fontWeight={700} color="#0D0D0D">
              Welcome to W3bstream Studio
            </Text>
            <Image mt="120px" w="350px" src="/images/polygon_2.svg" alt="" />
          </Box>
          <Box zIndex={9} ml="120px" w="580px" py="80px" px="40px" bg="#fff">
            <Text mb="60px" fontSize="30px" fontWeight={700} color="#1B1B1B">
              Login
            </Text>
            <JSONForm jsonstate={w3s.login.form} />
          </Box>
        </Flex>
      </Center>
    </Box>
  );
});

export default Login;

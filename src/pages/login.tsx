// @ts-nocheck
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { BsArrowRight } from 'react-icons/bs';
import { WalletConnectButton } from '@/components/WalletConnectButton';

const Login = observer(() => {
  return (
    <Box w="100vw" h="100vh" bg="#F7F4FF"  bg={`center / cover no-repeat url("../images/login_bg.png")`}>
      <Flex flexDirection={'column'} fontFamily={'Helvetica'} alignItems={'center'} pt={{base: '10vh', lg: '117px'}} >
        <Flex alignItems="center" justifyContent={'center'} mb="10vh">
          <Image h={{base: "60px", lg: "85px"}} src="../images/logo.png" alt="logo" />
        </Flex>
        <Flex flexDirection={'column'} alignItems={'center'} mb="5vh">
          <Image boxSize={'7.5rem'} src='../images/metamask.svg'></Image>
          <Text fontSize={'1.5rem'} color={'#946FFF'} fontWeight={700} mt="1.25rem">MetaMask</Text>
        </Flex>
        <WalletConnectButton name='Login With MetaMask' customStyle={{width: '90%', maxWidth: '520px', background: '#946FFF', color: '#Fff', height: '56px'}} hideIcon={true} />
        <Text fontFamily={'Helvetica'} fontSize={{base: "1.25rem", lg: '1.5rem'}} fontWeight={700} mt="10vh" mb="10px">Login to W3bstream Devnet</Text>
        <Text fontFamily={'Helvetica'} fontSize={{base: "14px", lg: "1rem"}}>Your portal to connect smart devices to smart contracts</Text>
      </Flex>
    </Box>
  );
});

export default Login;

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { Box, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { JSONForm } from '@/components/JSONForm';
import { BsArrowRight } from 'react-icons/bs';

const Login = observer(() => {
  const { w3s } = useStore();

  return (
    <Box w="100vw" h="100vh" minW="1440px" bg={`center / cover no-repeat url("../images/bg.png")`}>
      <Flex w="100%" h="100%" justifyContent="center" alignItems="center">
        <Flex>
          <Box>
            <Flex alignItems="center">
              <Image w="60px" src="/favicon.svg" alt="logo" />
              <Box ml="20px" fontWeight={700} fontSize="30px">
                W3bstream Devnet
              </Box>
            </Flex>
            <Box mt="100px" fontWeight={700} fontSize="24px">
              Documentation
            </Box>
            <Box mt="10px" maxW="500px" fontWeight={700} fontSize="14px" color="#7A7A7A">
              Get the most out of using Fastly for your site, service, orapplication through a series of articles and tutorials.
            </Box>
            <Link isExternal href="#" color="#946FFF" fontSize="14px">
              Read Full <Icon ml="5px" mb="-2px" as={BsArrowRight} />
            </Link>
          </Box>
          <Box zIndex={9} ml="130px" w="600px" p="80px 50px" bg="linear-gradient(180deg, rgba(255, 255, 255, 0.79) 0%, rgba(255, 255, 255, 0.35) 100%)" backdropFilter="blur(2px)" borderRadius="15px">
            <Text mb="60px" fontSize="24px" fontWeight={700} color="#0F0F0F">
              Login
            </Text>
            <JSONForm formState={w3s.user.loginForm} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Login;

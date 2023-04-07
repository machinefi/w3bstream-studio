import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store';
import { Box, Button, Flex, Icon, Image, Link, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { eventBus } from '@/lib/event';
import { BsArrowRight } from 'react-icons/bs';
import { defaultOutlineButtonStyle } from '@/lib/theme';

const enum Providers {
  METAMASK = 'metamask'
}

const signIn = async (connector: Providers) => {
  let provider: ethers.providers.Web3Provider;
  if (connector === 'metamask') {
    // @ts-ignore
    if (window.ethereum == null) {
      console.log('MetaMask not installed; using read-only defaults');
    } else {
      // @ts-ignore
      const metamask = window.ethereum;
      await metamask.request({
        method: 'eth_requestAccounts'
      });
      provider = new ethers.providers.Web3Provider(metamask);
    }
  }

  const [address] = await provider.listAccounts();
  if (!address) {
    throw new Error('Address not found.');
  }

  try {
    const chainId = await provider.getNetwork().then(({ chainId }) => chainId);
    const message = new SiweMessage({
      address,
      chainId,
      expirationTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
      domain: document.location.host,
      uri: document.location.origin,
      version: '1'
    });
    const signature = await provider.getSigner().signMessage(message.prepareMessage());
    const data = await fetch(`/api/w3bapp/login/wallet`, {
      method: 'PUT',
      body: JSON.stringify({
        signature,
        message: message.toMessage()
      })
    }).then((res) => res.json());
    if (data.token) {
      return {
        ...data,
        address
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

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
                W3bstream studio
              </Box>
            </Flex>
            <Box mt="100px" fontWeight={700} fontSize="24px">
              Documentation
            </Box>
            <Box mt="10px" maxW="500px" fontWeight={700} fontSize="16px" color="#7A7A7A">
              Get the most out of using Fastly for your site, service, orapplication through a series of articles and tutorials.
            </Box>
            <Link isExternal href="#" color="#946FFF" fontSize="14px">
              Read Full <Icon ml="5px" mb="-2px" as={BsArrowRight} />
            </Link>
          </Box>
          <Box zIndex={9} ml="130px" w="600px" p="80px 50px" bg="linear-gradient(180deg, rgba(255, 255, 255, 0.79) 0%, rgba(255, 255, 255, 0.35) 100%)" backdropFilter="blur(2px)" borderRadius="15px">
            <Text fontSize="24px" fontWeight={700}>
              Login with
            </Text>
            <Flex mt="60px" justify="center" align="center">
              <Button
                w="100%"
                {...defaultOutlineButtonStyle}
                leftIcon={<Image boxSize="20px" objectFit="cover" src="/images/icons/metamask.svg" alt="MetaMask" />}
                onClick={async () => {
                  const result = await signIn(Providers.METAMASK);
                  if (result) {
                    w3s.config.form.value.set({ token: result.token, accountID: result.accountID, accountRole: result.accountRole, address: result.address });
                    eventBus.emit('user.login');
                  }
                }}
              >
                MetaMask
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Login;

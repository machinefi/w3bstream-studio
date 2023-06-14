import { helper } from '@/lib/helper';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { useStore } from '@/store/index';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, ButtonProps, Flex, Popover, PopoverArrow, PopoverBody, Text, PopoverContent, PopoverHeader, PopoverTrigger } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Copy } from '../Common/Copy';
import { MetaMaskWallet } from '@thirdweb-dev/wallets';
import { SiweMessage } from 'siwe';
import { useEffect } from 'react';
import { eventBus } from '@/lib/event';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

interface WalletConnectButtonProps {
  name?: string;
  customStyle?: ButtonProps;
}

export const WalletConnectButton = observer(({ name, customStyle }: WalletConnectButtonProps) => {
  const {
    god,
    w3s,
    w3s: { config },
    lang: { t }
  } = useStore();

  const wallet = new MetaMaskWallet(null);

  useEffect(() => {
    wallet.autoConnect();
  }, []);

  const store = useLocalStore(() => ({
    isConnect: false,
    isConnecting: false,
    wallet: new MetaMaskWallet(null),
    async login() {
      console.log('login');
      // toast.loading('Please confirm the login request in your wallet.');
      try {
        const address = god.currentNetwork.account;
        const chainId = god.currentNetwork.currentChain.chainId;
        const message = new SiweMessage({
          address,
          chainId,
          expirationTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
          domain: document.location.host,
          uri: document.location.origin,
          version: '1'
        });
        // const signature = await signMessageAsync({
        //   message: message.prepareMessage()
        // });
        const signature = await wallet.signMessage(message.prepareMessage());
        const data = await fetch(`/api/w3bapp/login/wallet`, {
          method: 'PUT',
          body: JSON.stringify({
            signature,
            message: message.toMessage()
          })
        }).then((res) => res.json());
        if (data.token) {
          w3s.config.form.value.set({ token: data.token, accountID: data.accountID, accountRole: data.accountRole });
          eventBus.emit('user.login');
          toast.success(t('success.login.msg'));
        } else {
          toast.error(t('error.login.msg'));
        }
      } catch (error) {
        console.log(error);
        toast.error(t('error.login.msg'));
        // disconnectAsync();
      }
    },
    async logout() {
      // await disconnectAsync();
      god.currentNetwork.set({ account: '' });
      w3s.config.logout();
    }
  }));

  wallet.on('connect', async ({ address, chainId }) => {
    if (store.isConnecting) return;
    store.isConnecting = true;
    console.log({ address, chainId });
    god.setChainId(chainId);
    const signer = await wallet.getSigner();
    god.currentNetwork.set({
      account: address,
      signer
    });
    god.currentNetwork.loadBalance();
    if (!w3s.config.isLogin) {
      await store.login();
    }
    store.isConnect = true;
    store.isConnecting = false;
  });

  wallet.on('change', ({ address, chainId }) => {
    if (chainId) {
      god.setChainId(chainId);
    }
    if (address) {
      god.currentNetwork.set({
        account: address
      });
      god.currentNetwork.loadBalance();
    }
  });

  wallet.on('disconnect', () => {
    console.log('disconnect');
    store.logout();
    store.isConnect = false;
  });

  if (!store.isConnect) {
    return (
      <>
        <Button {...defaultOutlineButtonStyle} {...customStyle} onClick={() => wallet.connect()}>
          {name ? name : 'Connect a Wallet'}
        </Button>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Flex alignItems="center" p="5px 14px" bg="#F3F3F3" borderRadius="60px" cursor="pointer">
          <Avatar mr="8px" w="30px" h="30px" src={god.currentNetwork.chain.current.logoUrl} />
          <Flex alignItems="center">
            <Box>
              <Text fontSize="12px" fontWeight={700}>
                {god.currentChain.Coin.balance.format} {god.currentNetwork.currentChain.Coin.symbol}
              </Text>
              <Text fontSize="12px">{helper.string.truncate(god.currentNetwork.account || '0x......', 20, '...')}</Text>
            </Box>
            <ChevronDownIcon ml="5px" boxSize="24px" />
          </Flex>
        </Flex>
      </PopoverTrigger>
      <PopoverContent w="285px">
        <PopoverArrow />
        {/* <PopoverCloseButton /> */}
        <PopoverHeader>Account Information</PopoverHeader>
        <PopoverBody>
          <Flex align="center">
            <Text fontSize={'14px'} fontWeight={700}>
              Account ID:
            </Text>
            <Text fontSize={'12px'} ml="5px">
              {config.form.formData.accountID}
            </Text>
          </Flex>
          <Flex mt="10px" align="center">
            <Text fontSize={'14px'} fontWeight={700}>
              Address:
            </Text>
            <Text fontSize={'12px'} ml="5px">
              {helper.string.truncate(god.currentNetwork.account || '0x......', 20, '...')}
            </Text>
            <Copy value={god.currentNetwork.account} />
          </Flex>
          <Flex mt="10px" align="center">
            <Button
              w="100%"
              size="sm"
              {...defaultOutlineButtonStyle}
              onClick={async () => {
                wallet.disconnect();
              }}
            >
              Sign out
            </Button>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

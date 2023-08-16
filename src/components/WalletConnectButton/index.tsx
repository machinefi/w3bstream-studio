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
import { BiLogOut } from 'react-icons/bi';
import { MdSettings } from 'react-icons/md';
import Link from 'next/link';

interface WalletConnectButtonProps {
  name?: string;
  customStyle?: ButtonProps;
}

export const WalletConnectButton = observer(({ name, customStyle }: WalletConnectButtonProps) => {
  const {
    god,
    w3s,
    w3s: { config },
    lang: { t },
    wallet
  } = useStore();
  const { token } = w3s.config.form.formData;

  useEffect(() => {
    // wallet.wallet.autoConnect();
  }, []);

  if (!wallet.isConnect || !token) {
    return (
      <>
        <Button {...defaultOutlineButtonStyle} {...customStyle} onClick={() => wallet.wallet.connect()}>
          {name ? name : 'Connect a Wallet'}
        </Button>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Flex alignItems="center" p="5px 14px" bg="#F3F3F3" borderRadius="60px" cursor="pointer">
          <Avatar mr="8px" w="30px" h="30px" src={god.currentNetwork?.chain?.current?.logoUrl} />
          <Flex alignItems="center">
            <Box>
              <Text fontSize="12px" fontWeight={700}>
                {god.currentChain?.Coin?.balance.format} {god.currentNetwork.currentChain?.Coin?.symbol}
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
                wallet.wallet.disconnect();
              }}
              leftIcon={<BiLogOut />}
            >
              Sign out
            </Button>

            <Link href="/setting">
              <Button
                w="100%"
                size="sm"
                ml={2}
                {...defaultOutlineButtonStyle}
                // onClick={async () => {
                //   w3s.currentHeaderTab = 'SETTING';
                // }}
                leftIcon={<MdSettings />}
              >
                Setting
              </Button>
            </Link>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});

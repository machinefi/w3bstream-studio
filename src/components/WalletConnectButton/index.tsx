import { helper } from '@/lib/helper';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { useStore } from '@/store/index';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, ButtonProps, Flex, Image } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { observer } from 'mobx-react-lite';

interface WalletConnectButtonProps {
  name?: string;
  customStyle?: ButtonProps;
}

export const WalletConnectButton = observer(({ name, customStyle }: WalletConnectButtonProps) => {
  const { god } = useStore();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!ready) {
          return null;
        }

        if (!connected) {
          return (
            <Button
              {...defaultOutlineButtonStyle}
              {...customStyle}
              onClick={openConnectModal}
            >
              {name ? name : 'Connect a Wallet'}
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Box p="10px 20px" color="#e53b3b" fontWeight={700} flexWrap="nowrap" borderRadius="6px" background="#ffe2e2" onClick={openChainModal}>
              Wrong network
            </Box>
          );
        }

        return (
          <Flex alignItems="center" p="5px 16px" bg="#F3F3F3" borderRadius="60px" cursor="pointer">
            <Avatar mr="8px" w="30px" h="30px" src={god.currentNetwork.chain.current.logoUrl} onClick={openChainModal} />
            <Flex
              alignItems="center"
              onClick={() => {
                openAccountModal();
                close();
              }}
            >
              <Box>
                <Box fontSize="14px" fontWeight={700}>
                  {god.currentChain.Coin.balance.format} {god.currentNetwork.currentChain.name}
                </Box>
                <Box fontSize="12px">{helper.string.truncate(god.currentNetwork.account || '0x......', 20, '...')}</Box>
              </Box>
              <ChevronDownIcon ml="5px" boxSize="24px" />
            </Flex>
          </Flex>
        );
      }}
    </ConnectButton.Custom>
  );
});

import { useEffect } from 'react';
import { WagmiConfig, useAccount, useConnect, useDisconnect, useNetwork, useSignMessage } from 'wagmi';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { showNotification, updateNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { SiweMessage } from 'siwe';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

export const WagmiProvider = observer(({ children }) => {
  const { god } = useStore();
  return (
    <WagmiConfig client={god.wagmiClient}>
      <RainbowKitProvider chains={god.wagmiChains}>
        {children}
        <Wallet />
      </RainbowKitProvider>
    </WagmiConfig>
  );
});

const Wallet = observer(() => {
  const { god, w3s, lang: { t } } = useStore();
  const { chain } = useNetwork();
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading } = useConnect({
    onSuccess(data) {
      console.log('Connect Success', data);
    }
  });
  const { disconnectAsync } = useDisconnect({
    onError(error) {
      console.log('Disconnect Error', error);
    },
    onSettled(data, error) {
      console.log('Disconnect Settled', { data, error });
    },
    onSuccess(data) {
      console.log('Disconnect Success', data);
    }
  });

  const { signMessageAsync } = useSignMessage();

  const store = useLocalStore(() => ({
    connect() {
      connect({ connector: connectors[0] });
    },
    async login() {
      showNotification({
        id: 'login',
        title: 'Login',
        loading: true,
        message: 'Please confirm the login request in your wallet.',
        color: 'yellow',
        autoClose: false
      });
      try {
        const address = god.currentNetwork.account;
        const chainId = god.currentNetwork.currentChain.chainId;
        const message = new SiweMessage({
          address,
          chainId,
          expirationTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
          domain: document.location.host,
          uri: document.location.origin,
          version: '1'
        });
        const signature = await signMessageAsync({
          message: message.prepareMessage()
        });
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
          updateNotification({
            id: 'login',
            title: 'Login',
            loading: false,
            message: t("success.login.msg"),
            color: 'green',
            autoClose: 3000
          });
        } else {
          updateNotification({
            id: 'login',
            title: 'Login',
            loading: false,
            message: t("error.login.msg"),
            color: 'red',
            autoClose: 1000
          });
          disconnectAsync();
        }
      } catch (error) {
        updateNotification({
          id: 'login',
          title: 'Login',
          loading: false,
          message: t("error.login.msg"),
          color: 'red',
          autoClose: 1000
        });
        disconnectAsync();
      }
    },
    async logout() {
      await disconnectAsync();
      god.currentNetwork.set({ account: '' });
      w3s.config.logout();
    }
  }));

  useEffect(() => {
    // if (isLoading) {
    //   return;
    // }
    if (isConnected && w3s.config.isLogin) {
      eventBus.emit('user.login');
    }
    if (!isConnected && w3s.config.isLogin) {
      store.logout();
    }
    if (connector) {
      connector.getChainId().then((chainId) => {
        if (god.currentNetwork.allowChains.includes(chainId)) {
          god.setChainId(chainId);
          connector.getSigner().then((signer) => {
            god.currentNetwork.set({
              account: address,
              signer
            });
            god.currentNetwork.loadBalance();
            if (!w3s.config.isLogin) {
              store.login();
            }
          });
        } else {
          god.isWrongNetwork.setValue(true);
          showNotification({
            id: 'wrongNetwork',
            title: 'Wrong Network',
            message: 'Please switch to the correct network.',
            color: 'red',
            autoClose: true
          });
        }
      });
    }
  }, [isConnected, error, connector, chain, address, w3s.config.isLogin]);

  useEffect(() => {
    //@ts-ignore
    const { ethereum } = window;
    if (ethereum && ethereum.on) {
      const handleChainChanged = (e) => {
        god.currentNetwork.loadBalance();
      };
      const handleAccountChanged = (e) => {
        store.logout();
      };
      ethereum.on('networkChanged', handleChainChanged);
      ethereum.on('close', handleChainChanged);
      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountChanged);
      return () => {
        ethereum.removeListener('networkChanged', handleChainChanged);
        ethereum.removeListener('close', handleChainChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
        ethereum.removeListener('accountsChanged', handleAccountChanged);
      };
    }
  }, []);

  return <></>;
});

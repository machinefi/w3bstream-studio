import { eventBus } from '@/lib/event';
import { MetaMaskWallet } from '@thirdweb-dev/wallets';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';
import { SiweMessage } from 'siwe';
import { rootStore } from '.';

export class WalletStore {
  isConnect = false;
  isConnecting = false;
  isLogin = false;
  wallet = new MetaMaskWallet(null);

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      this.wallet.autoConnect();

      this.wallet.removeAllListeners();

      this.wallet.on('connect', async ({ address, chainId }) => {
        if (this.isConnecting) return;
        this.isConnecting = true;
        console.log({ address, chainId });
        rootStore.god.setChainId(chainId);
        const signer = await this.wallet.getSigner();
        rootStore.god.currentNetwork.set({
          account: address,
          signer
        });
        rootStore.god.currentNetwork.loadBalance();
        if (!rootStore.w3s.config.isLogin) {
          await this.login();
        }
        this.isConnect = true;
        this.isConnecting = false;
      });

      this.wallet.on('change', ({ address, chainId }) => {
        if (chainId) {
          rootStore.god.setChainId(chainId);
        }
        if (address) {
          rootStore.god.currentNetwork.set({
            account: address
          });
          rootStore.god.currentNetwork.loadBalance();
        }
      });

      this.wallet.on('disconnect', () => {
        console.log('disconnect');
        this.logout();
        this.isConnect = false;
      });
    }
  }

  async login() {
    // toast.loading('Please confirm the login request in your wallet.');
    const t = rootStore.lang.t;
    try {
      const address = rootStore.god.currentNetwork.account;
      const chainId = rootStore.god.currentNetwork.currentChain.chainId;
      const message = new SiweMessage({
        address,
        chainId,
        expirationTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        domain: document.location.host,
        uri: document.location.origin,
        version: '1'
      });

      const signature = await this.wallet.signMessage(message.prepareMessage());
      const data = await fetch(`/api/w3bapp/login/wallet`, {
        method: 'PUT',
        body: JSON.stringify({
          signature,
          message: message.toMessage()
        })
      }).then((res) => res.json());
      if (data.token) {
        rootStore.w3s.config.form.value.set({ token: data.token, accountID: data.accountID, accountRole: data.accountRole });
        eventBus.emit('user.login');
        toast.success(t('success.login.msg'));
      } else {
        toast.error(t('error.login.msg'));
      }
    } catch (error) {
      console.log(error);
      toast.error(t('error.login.msg'));
    }
  }

  async logout() {
    rootStore.god.currentNetwork.set({ account: '' });
    rootStore.w3s.config.logout();
  }
}

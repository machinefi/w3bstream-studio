import { rootStore } from '@/store/index';
import { eventBus } from './event';

export const hooks = {
  async waitLogin() {
    return new Promise<void>((res, rej) => {
      if (rootStore.w3s.isLogin) {
        res();
      } else {
        eventBus.once('user.login', res);
      }
    });
  }
};

import { FormModalState } from '@/store/base';
import { rootStore } from '@/store/index';
import { eventBus } from './event';

export const hooks = {
  async waitReady() {
    return new Promise<void>((res, rej) => {
      if (rootStore.w3s.isReady) {
        res();
      } else {
        eventBus.once('app.ready', res);
      }
    });
  },
  async waitLogin() {
    return new Promise<void>((res, rej) => {
      if (rootStore.w3s.config.isLogin) {
        res();
      } else {
        eventBus.once('user.login', res);
      }
    });
  },
  async getFormData<T = any>(v: Partial<FormModalState>) {
    return new Promise<T>((resolve, reject) => {
      rootStore.base.formModal.setData({
        ...v,
        isOpen: true
      });
      eventBus.once('base.formModal.afterSubmit', (formData: T) => {
        if (rootStore.base.formModal.isAutomaticallyClose) {
          rootStore.base.formModal.close();
        }
        resolve(formData);
      });
      eventBus.once('base.formModal.abort', () => {
        rootStore.base.formModal.close();
        reject('abort');
      });
    });
  },
  async delay(ms: number) {
    return new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, ms);
    });
  }
};

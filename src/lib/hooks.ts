import { FormListType } from '@/store/base';
import { rootStore } from '@/store/index';
import { JSONSchemaFormState } from '@/store/standard/JSONSchemaState';
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
      if (rootStore.w3s.isLogin) {
        res();
      } else {
        eventBus.once('user.login', res);
      }
    });
  },
  async getFormData<T = any>(v: { title: string; size: string; formList: FormListType[]; children?: JSX.Element }) {
    return new Promise<T>((resolve, reject) => {
      rootStore.base.formModal.setData({
        ...v,
        isOpen: true
      });
      eventBus.once('base.formModal.afterSubmit', (formData: T) => {
        rootStore.base.formModal.setData({
          isOpen: false,
          children: null
        });
        resolve(formData);
      });
      eventBus.once('base.formModal.abort', () => {
        rootStore.base.formModal.setData({
          isOpen: false,
          children: null
        });
        reject('abort');
      });
    });
  }
};

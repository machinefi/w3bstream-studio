import { FormModalState } from '@/store/base';
import { rootStore } from '@/store/index';
import { eventBus } from './event';
import initSqlJs from 'sql.js';
import { IndexDb } from './dexie';
import { resolve } from 'path';
import { helper } from './helper';

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
  async waitSQLJSReady() {
    return new Promise((resolve, reject) => {
      try {
        initSqlJs({
          locateFile: (file) => `/wasms/${file}`
        }).then((SQL) => {
          // console.log('sql.js loaded', SQL);
          // const persistedData = localStorage.getItem('s');
          IndexDb.kvs
            .filter((i) => i.key == 'sqlite')
            .toArray()
            .then((res) => {
              if (res.length > 0) {
                console.log(res);
                resolve(new SQL.Database(helper.base64ToUint8Array(res[0].value)));
              } else {
                resolve(new SQL.Database());
              }
            });
        });
      } catch (e) {
        reject(e.message);
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

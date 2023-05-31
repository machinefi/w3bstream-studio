import { FormModalState } from '@/store/base';
import { eventBus } from './event';
import initSqlJs from 'sql.js';
import { IndexDb } from './dexie';
import { helper } from './helper';
import { axios } from './axios';

export const hooks = {
  async waitReady() {
    return new Promise<void>((res, rej) => {
      if (globalThis.store.w3s.isReady) {
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
      if (globalThis.store.w3s.config.isLogin) {
        res();
      } else {
        eventBus.once('user.login', res);
      }
    });
  },
  async getFormData<T = any>(v: Partial<FormModalState>) {
    return new Promise<T>((resolve, reject) => {
      globalThis.store.base.formModal.setData({
        ...v,
        isOpen: true
      });
      eventBus.once('base.formModal.afterSubmit', (formData: T) => {
        if (globalThis.store.base.formModal.isAutomaticallyClose) {
          globalThis.store.base.formModal.close();
        }
        resolve(formData);
      });
      eventBus.once('base.formModal.abort', () => {
        globalThis.store.base.formModal.close();
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
  },
  async waitPublisher() {
    const curProject = globalThis.store.w3s.project.curProject;
    const pub = curProject?.publishers.find((item) => item.f_project_id === curProject?.f_project_id);
    if (pub) {
      return pub.f_token;
    } else {
      try {
        const key = `default`;
        const res = await axios.request({
          method: 'post',
          url: `/api/w3bapp/publisher/x/${curProject?.name}`,
          data: {
            key,
            name: key
          }
        });
        eventBus.emit('publisher.create');
        return res.data?.token;
      } catch (error) {
        return;
      }
    }
  }
};

import { FormModalState } from '@/store/base';
import { eventBus } from './event';
import initSqlJs from 'sql.js';
import { IndexDb } from './dexie';
import { helper } from './helper';
import { axios } from './axios';
import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';

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
  },
  async getSimpleFormData<T>(data: T, metadata: { [key: string]: any } & Partial<JSONSchemaFormState<any>>, config: Partial<FormModalState>) {
    const value = {};
    const uiProps = {};
    const props = Object.entries(data).reduce((p, c) => {
      const [k, v] = c;
      p[k] = {
        type: typeof v,
        title: metadata[k].title || v
      };
      delete metadata[k].title;
      value[k] = v;
      return p;
    }, {});
    const schema = {
      type: 'object',
      properties: props
    };
    const form = new FormModalState({
      ...config,
      isOpen: true,
      formList: [
        {
          form: new JSONSchemaFormState({
            //@ts-ignore
            schema,
            uiSchema: {
              'ui:submitButtonOptions': {
                norender: false,
                submitText: 'Submit'
              },
              ...metadata
            },
            afterSubmit(e) {
              eventBus.emit('base.formModal.afterSubmit', e.formData);
              this.reset();
            },
            value: new JSONValue({
              default: value
            })
          })
        }
      ]
    });

    return hooks.getFormData<T>(form);
  }
};

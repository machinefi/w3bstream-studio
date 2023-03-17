import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

export const loginSchema = {
  // title: 'Login',
  type: 'object',
  properties: {
    username: { type: 'string', title: 'Username' },
    password: { type: 'string', title: 'Password' }
  },
  required: ['username', 'password']
} as const;

export const pwdSchema = {
  type: 'object',
  properties: {
    oldPassword: { type: 'string', title: 'Old password' },
    password: { type: 'string', title: 'New password' }
  },
  required: ['password']
} as const;

type LoginSchemaType = FromSchema<typeof loginSchema>;
type PWDSchemaType = FromSchema<typeof pwdSchema>;

export default class UserModule {
  loginForm = new JSONSchemaFormState<LoginSchemaType>({
    //@ts-ignore
    schema: loginSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Login'
      },
      password: {
        'ui:widget': 'password'
      }
    },
    async afterSubmit(e) {
      const res = await axios.request({
        method: 'put',
        url: '/api/w3bapp/login',
        data: e.formData
      });
      if (res.data.token) {
        globalThis.store.w3s.config.form.value.set({ token: res.data.token, accountID: res.data.accountID, accountRole: 'ADMIN' });
        eventBus.emit('user.login');
        this.reset({ force: true });
      }
    },
    value: new JSONValue<LoginSchemaType>({
      default: {
        username: 'admin',
        password: 'iotex.W3B.admin'
      }
    })
  });

  pwdForm = new JSONSchemaFormState<PWDSchemaType>({
    //@ts-ignore
    schema: pwdSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Update'
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.pwdForm.reset();
    },
    value: new JSONValue<PWDSchemaType>({
      default: {
        oldPassword: '',
        password: ''
      }
    })
  });
}

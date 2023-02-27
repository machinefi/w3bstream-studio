import { JSONModalValue, JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { showNotification } from '@mantine/notifications';

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
    password: { type: 'string', title: 'Password' }
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
        submitText: 'Login',
        props: {
          w: '100%',
          h: '32px',
          ...gradientButtonStyle
        }
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
        globalThis.store.w3s.config.form.value.set({ token: res.data.token, accountID: res.data.accountID });
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
        submitText: 'Update',
        props: {
          w: '100%',
          h: '32px',
          ...gradientButtonStyle
        }
      }
    },
    afterSubmit: async (e) => {
      const res = await axios.request({
        method: 'put',
        url: `/api/w3bapp/account/${globalThis.store.w3s.config.form.formData.accountID}`,
        data: e.formData
      });
      showNotification({ message: 'update password succeeded' });
      eventBus.emit('user.update-pwd');
      this.form.reset();
      this.modal.set({ show: false });
      globalThis.store.w3s.config.logout();
    },
    value: new JSONValue<PWDSchemaType>({
      default: {
        password: ''
      }
    })
  });

  form: JSONSchemaFormState<PWDSchemaType> = this.pwdForm;

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Update Password',
      autoReset: true
    }
  });
}

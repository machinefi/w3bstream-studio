import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { rootStore } from '@/store/index';
import { FromSchema } from 'json-schema-to-ts';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  // title: 'Login',
  type: 'object',
  properties: {
    username: { type: 'string', title: 'Username' },
    password: { type: 'string', title: 'Password' }
  },
  required: ['username', 'password']
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class LoginModule {
  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Login',
        props: {
          w: '100%',
          h: '32px',
          ...gradientButtonStyle
        }
      }
    },
    async afterSubmit(e) {
      const res = await axios.request({
        method: 'put',
        url: '/api/w3bapp/login',
        data: e.formData
      });
      if (res.data.token) {
        //@ts-ignore
        rootStore.w3s.config.form.value.set({ token: res.data.token, accountID: res.data.accountID });
        eventBus.emit('user.login');
        this.reset({ force: true });
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        username: 'admin',
        password: 'iotex.W3B.admin'
      }
    })
  });
}

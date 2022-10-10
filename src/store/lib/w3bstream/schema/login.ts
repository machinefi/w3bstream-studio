import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '@/lib/axios';
import { rootStore } from '../../../index';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { eventBus } from '../../../../lib/event';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Login',
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['username', 'password']
} as const;

type SchemaType = FromSchema<typeof schema>;

export class LoginSchema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<LoginSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: false,
          submitText: 'Login'
        }
      },
      reactive: true,
      afterSubmit: async (e) => {
        const res = await axios.request({
          method: 'put',
          url: '/srv-applet-mgr/v0/login',
          data: e.formData
        });
        if (res.data.token) {
          //@ts-ignore
          rootStore.w3s.config.setData({ token: res.data.token, accountID: res.data.accountID });
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
}

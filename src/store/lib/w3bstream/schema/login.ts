import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '@/lib/axios';
import { rootStore } from '../../../index';
import { JSONValue } from '../../../standard/JSONSchemaState';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Login Test',
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' }
  },
  require: ['username', 'password']
} as const;

type SchemaType = FromSchema<typeof schema>;

export const loginSchema = new JSONSchemaState<SchemaType>({
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
      rootStore.w3s.config.setData({ token: res.data.token });
    }
  },
  value: new JSONValue<SchemaType>({
    value: {
      username: 'admin'
    }
  })
});

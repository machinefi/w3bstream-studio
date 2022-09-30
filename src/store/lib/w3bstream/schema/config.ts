import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { StorageState } from '../../../standard/StorageState';

export const schema = {
  // export const schema: JSONSchema7 = {
  title: 'Setting',
  type: 'object',
  properties: {
    apiUrl: { type: 'string', minimum: 3 },
    token: { type: 'string', minimum: 3 }
  },
  required: ['apiUrl', 'token']
} as const;

type ConfigType = FromSchema<typeof schema>;

export class W3bstreamConfigState extends JSONSchemaState<ConfigType> {
  constructor(args: Partial<W3bstreamConfigState>) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: true,
          submitText: 'Update'
        }
      },
      reactive: true,
      value: new StorageState<ConfigType>({ key: 'w3bstream-config', default: { apiUrl: process.env['NEXT_PUBLIC_API_URL'], token: '' } })
    });
  }
  setToken() {}
  logout() {
    this.setData({
      apiUrl: '',
      token: ''
    });
  }
}

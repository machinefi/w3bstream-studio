import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { StorageState } from '../../../standard/StorageState';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Setting',
  type: 'object',
  properties: {
    apiUrl: { type: 'string' },
    token: { type: 'string' }
  }
} as const;

type ConfigType = FromSchema<typeof schema>;

export class W3bstreamConfigState<T> extends JSONSchemaState<ConfigType> {
  logout() {
    this.setData({
      token: null
    });
  }
}

export const w3bstreamConfigSchema = new W3bstreamConfigState<ConfigType>({
  //@ts-ignore
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: true,
      submitText: 'Update'
    }
  },
  reactive: true,
  value: new StorageState<ConfigType>({ key: 'w3bstream-config', default: { apiUrl: 'http://localhost:8888' } })
});

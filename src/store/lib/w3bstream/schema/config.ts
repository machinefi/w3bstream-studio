import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { observable } from 'mobx';
import { LocalStorageValue } from '../../../standard/JSONSchemaState';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Setting',
  type: 'object',
  properties: {
    apiUrl: { type: 'string' },
    token: { type: 'string' }
  },
  require: ['w3bsream']
} as const;

type ConfigType = FromSchema<typeof schema>;

export const w3bstreamConfigSchema = new JSONSchemaState<ConfigType>({
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: true,
      submitText: 'Update'
    }
  },
  reactive: true,
  value: new LocalStorageValue({ key: 'w3bstream-config', default: { apiUrl: 'http://localhost:8888' } })
});

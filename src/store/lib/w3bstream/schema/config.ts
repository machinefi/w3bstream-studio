import { JSONSchemaFormState } from '@/store/standard/JSONSchemaState';
import { StorageState } from '@/store/standard/StorageState';
import { FromSchema } from 'json-schema-to-ts';

export const schema = {
  title: 'Setting',
  type: 'object',
  properties: {
    apiUrl: { type: 'string', minimum: 3 },
    token: { type: 'string', minimum: 3 },
    accountID: { type: 'string' }
  },
  required: ['apiUrl', 'token', 'accountID']
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class W3bstreamConfigModule {
  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
        submitText: 'Update'
      }
    },
    value: new StorageState<SchemaType>({ key: 'w3bstream-config', default: { apiUrl: '', token: '', accountID: '', accountRole: '', address: '' } })
  });

  logout() {
    this.form.reset();
  }
}

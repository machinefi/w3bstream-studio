import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
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

export class W3bstreamConfigState extends JSONSchemaState<SchemaType> {
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
      value: new StorageState<SchemaType>({ key: 'w3bstream-config', default: { apiUrl: process.env['NEXT_PUBLIC_API_URL'], token: '', accountID: '' } })
    });
  }
  logout() {
    this.reset();
  }
}

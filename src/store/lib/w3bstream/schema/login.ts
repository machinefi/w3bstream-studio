import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Setting',
  type: 'object',
  properties: {
    w3bsream: {
      title: 'w3bsream',
      type: 'object',
      properties: {
        apiUrl: {
          type: 'string'
        }
      }
    }
  }
} as const;

type ConfigType = FromSchema<typeof schema>;

export const loginSchema = new JSONSchemaState<ConfigType>({
  schema,
  reactive: true,
  onSubmit(e): void {
    console.log(e.formData.w3bsream);
  },
  formData: {
    w3bsream: { apiUrl: 'http://localhost:8888' }
  }
});

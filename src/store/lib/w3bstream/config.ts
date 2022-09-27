import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';

export const configSchema = {
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

type ConfigType = FromSchema<typeof configSchema>;

export const w3bstreamConfig = new JSONSchemaState<ConfigType>({
  //@ts-ignore
  schema: configSchema,
  reactive: true,
  onSubmit(e): void {
    console.log(e.formData.w3bsream);
  },
  formData: {
    w3bsream: { apiUrl: 'http://localhost:8888' }
  }
});

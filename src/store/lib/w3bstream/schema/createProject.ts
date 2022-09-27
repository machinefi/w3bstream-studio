import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Create Project Test',
  type: 'object',
  properties: {
    name: { type: 'string' }
  },
  require: ['name']
} as const;

type ConfigType = FromSchema<typeof schema>;

export const createProjectSchema = new JSONSchemaState<ConfigType>({
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: false,
      submitText: 'Submit'
    }
  },
  reactive: true,
  onSubmit(e): void {
    console.log(e.formData);
  },
  formData: {}
});

import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '../../../../lib/axios';
import { JSONValue } from '../../../standard/JSONSchemaState';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  title: 'Create Project Test',
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string' }
  },
  require: ['name', 'version']
} as const;

type SchemaType = FromSchema<typeof schema>;

export const createProjectSchema = new JSONSchemaState<SchemaType>({
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: false,
      submitText: 'Submit'
    }
  },
  reactive: true,
  afterSubmit: async (e) => {
    const res = await axios.request({
      method: 'put',
      url: '/srv-applet-mgr/v0/project',
      data: e.formData
    });
  },
  extraData: { isOpen: false },
  value: new JSONValue<SchemaType>({
    value: {
      name: 'project_01',
      version: '0.0.1'
    }
  })
});

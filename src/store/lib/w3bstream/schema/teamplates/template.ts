import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '../definitions';

export const schema = {
  // export const schema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  title: 'Tamplates',
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects' }
  },
  required: ['projectID']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export class TemplateSchema {
  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: true,
        submitText: 'Submit'
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: ''
      }
    })
  });
}

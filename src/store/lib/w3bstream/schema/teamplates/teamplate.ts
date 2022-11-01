import { JSONModalValue, JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';

export const schema = {
  // export const schema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
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

export default class TemplateModule {
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

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'modal teamplate',
      autoReset: true
    }
  });

  table = new JSONSchemaTableState<any>({
    columns: [],
    rowKey: ''
  });
}

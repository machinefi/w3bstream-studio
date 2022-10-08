import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { definitions } from './definitions';

export const schema = {
  // export const configSchema: JSONSchema7 = {
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

export class TemplateSchema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<TemplateSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: true,
          submitText: 'Submit'
        }
      },
      reactive: true,
      value: new JSONValue<SchemaType>({
        default: {
          projectID: ''
        }
      })
    });
  }
}

import { JSONSchemaState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from './definitions';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  title: 'Projects',
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' }
  },
  required: ['projectID']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export class ProjectListSchema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<ProjectListSchema> = {}) {
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

      value: new JSONValue<SchemaType>({
        default: {
          projectID: ''
        }
      })
    });
  }
}

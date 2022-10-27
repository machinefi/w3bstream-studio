import { JSONSchemaFormState, JSONValue } from '@/store/standard/JSONSchemaState';
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

export class ProjectListSchema {
  constructor({
    getDymaicData
  }: Partial<{
    getDymaicData: () => {
      ready: boolean;
    };
  }> = {}) {
    if (getDymaicData) {
      this.form.getDymaicData = getDymaicData;
    }
  }

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

import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '../../../../lib/axios';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';
import { rootStore } from '../../../index';
import { dataURItoBlob } from '@rjsf/utils';
import { definitions } from './definitions';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  title: 'Applet List',
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

export class AppletListSchema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<AppletListSchema> = {}) {
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
      afterChange(e) {
        if (!e.formData.projectID) return;
        rootStore.w3s.applets.call({ projectID: e.formData.projectID });
      },
      reactive: true,
      value: new JSONValue<SchemaType>({
        projectID: ''
      })
    });
  }
}

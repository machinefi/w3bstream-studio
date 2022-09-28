import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '@/lib/axios';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { definitions } from './definitions';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string'
    },
    applets: {
      type: 'string'
    },
    event: {
      type: 'string',
      enum: ['start']
    }
  },
  title: 'Publish Event',
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects' },
    appletID: { $ref: '#/definitions/applets' },
    event: { $ref: '#/definitions/event' }
  },
  required: ['projectID', 'appletID', 'event']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  ...schema.definitions,
  projects: definitions.projects,
  applets: definitions.applets
};

export const publishEventSchema = new JSONSchemaState<SchemaType>({
  //@ts-ignore
  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: true
    }
  },
  reactive: true,
  afterSubmit: async (e) => {
    const { projectID, appletID, event } = e.formData;
    const res = await axios.request({
      method: 'post',
      url: `/srv-applet-mgr/v0/event/${projectID}/${appletID}/${event}`,
      headers: {
        publisher: Math.random(),
        'Content-Type': 'text/plain'
      },
      data: 'input a test sentence'
    });
  },
  value: new JSONValue<SchemaType>({
    projectID: '',
    appletID: '',
    event: 'start'
  })
});

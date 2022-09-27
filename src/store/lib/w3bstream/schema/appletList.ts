import { JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { JSONSchema7 } from 'json-schema';
import { axios } from '../../../../lib/axios';
import { JSONValue } from '../../../standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';
import { rootStore } from '../../../index';
import { dataURItoBlob } from '@rjsf/utils';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string',
      get enum() {
        return rootStore.w3s.projects.value?.data?.map((i) => i.projectID) || [];
      },
      get enumNames() {
        return rootStore.w3s.projects.value?.data?.map((i) => `${i.name}-${i.version}`) || [];
      }
    }
  },
  title: 'Applet List',
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects' }
  },
  required: ['projectID']
} as const;
//@ts-ignore
// schema.definitions.projects = {
//   type: 'string',
//   get enum() {
//     return rootStore.w3s.projects.value?.data?.map((i) => i.projectID) || [];
//   },
//   get enumNames() {
//     return rootStore.w3s.projects.value?.data?.map((i) => i.name) || [];
//   }
// };

type SchemaType = FromSchema<typeof schema>;

export const appletListSchema = new JSONSchemaState<SchemaType>({
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

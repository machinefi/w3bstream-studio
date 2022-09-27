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
  title: 'Deploy Project Test',
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'data-url',
      title: 'Single file'
    },
    info: {
      type: 'object',
      properties: {
        projectID: { $ref: '#/definitions/projects' },
        appletName: { type: 'string' }
      }
    }
  },
  required: ['file', 'info']
} as const;

type SchemaType = FromSchema<typeof schema>;

export const deployProjectSchema = new JSONSchemaState<SchemaType>({
  //@ts-ignore

  schema,
  uiSchema: {
    'ui:submitButtonOptions': {
      norender: false,
      submitText: 'Submit'
    }
  },
  reactive: true,
  afterSubmit: async (e) => {
    let formData = new FormData();
    const file = dataURItoBlob(e.formData.file);
    formData.append('file', file.blob);
    formData.append('info', JSON.stringify(e.formData.info));
    const res = await axios.request({
      method: 'post',
      url: '/srv-applet-mgr/v0/applet',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    });
    if (res.data) {
      await showNotification({ message: 'create applet successed' });
    }
    // rootStore.w3s.projects.call();
  },
  //@ts-ignore
  value: new JSONValue<SchemaType>({
    info: {
      appletName: 'app_01'
    }
  })
});

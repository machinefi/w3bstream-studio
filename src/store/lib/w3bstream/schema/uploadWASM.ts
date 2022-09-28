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
  title: 'Upload WASM',
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

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export class UploadWASMSChema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<UploadWASMSChema> = {}) {
    super(args);
    this.init({
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
          rootStore.w3s.applets.call({});
        }
        // rootStore.w3s.projects.call();
      },
      //@ts-ignore
      value: new JSONValue<SchemaType>({
        info: {
          appletName: 'app_01',
          projectID: ''
        }
      })
    });
  }
}

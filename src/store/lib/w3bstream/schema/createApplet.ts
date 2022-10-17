import { JSONValue, JSONSchemaModalState, JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob } from '@rjsf/utils';
import { definitions } from './definitions';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  // title: 'Create Applet',
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'data-url',
      title: 'Single file'
    },
    projectID: { $ref: '#/definitions/projects' },
    appletName: { type: 'string' }
  },
  required: ['file', 'info']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class CreateAppletSchema extends JSONSchemaState<SchemaType, ExtraDataType> {
  constructor(args: Partial<CreateAppletSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: false,
          submitText: 'Submit',
          props: {
            w: '100%',
            h: '32px',
            ...gradientButtonStyle
          }
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
          eventBus.emit('applet.create');
          this.reset();
          this.setExtraData({
            modal: { ...this.extraData.modal, show: false }
          });
        }
      },
      setFormat: (val) => {
        val.projectID = `${val.projectID}`;
        return val;
      },
      value: new JSONValue<SchemaType>({
        //@ts-ignore
        default: {
          appletName: 'app_01',
          projectID: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        //@ts-ignore
        default: {
          modal: { show: false, title: 'Create Applet' }
        }
      })
    });
  }
}

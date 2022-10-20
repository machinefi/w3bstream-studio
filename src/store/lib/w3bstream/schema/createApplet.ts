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
    info: {
      type: 'object',
      title: '',
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
        },
        file: {
          'ui:options': {
            accept: '.wasm'
          }
        }
      },
      afterSubmit: async (e) => {
        let formData = new FormData();
        console.log(this.extraValue);
        const file = dataURItoBlob(e.formData.file);
        formData.append('file', file.blob);
        formData.append('info', JSON.stringify(e.formData.info));
        const res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/applet/${e.formData.info.projectID}`,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data: formData
        });
        if (res.data) {
          await showNotification({ message: 'create applet successed' });
          eventBus.emit('applet.create');
          this.reset();
          this.extraValue.set({ modal: { show: false } });
        }
      },
      value: new JSONValue<SchemaType>({
        //@ts-ignore
        default: {
          info: {
            appletName: 'app_01',
            projectID: ''
          }
        },
        setFormat: (val) => {
          if (val.info.projectID) {
            val.info.projectID = `${val.info.projectID}`;
          }
          return val;
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        //@ts-ignore
        default: {
          modal: { show: false, title: 'Create Applet' },
        }
      })
    });
  }
}

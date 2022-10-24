import { JSONValue, JSONSchemaModalState, JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob } from '@rjsf/utils';
import { definitions } from './definitions';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import FileWidget from '@/components/FileWidget';

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
      title: 'Upload Single File'
    },
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
    appletName: { type: 'string', title: 'Applet Name' }
  },
  required: ['file', 'projectID', 'appletName']
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
      widgets: {
        FileWidget
      },
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
          'ui:widget': 'file',
          'ui:options': {
            // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
            accept: {
              'application/wasm': ['.wasm']
            },
            tips: `Drag 'n' drop a file here, or click to select a file`
            // Maximum accepted number of files The default value is 0 which means there is no limitation to how many files are accepted.
            // maxFiles: 1,
            // Allow drag 'n' drop (or selection from the file dialog) of multiple files
            // multiple: false
          }
        }
      },
      afterSubmit: async (e) => {
        let formData = new FormData();
        const file = dataURItoBlob(e.formData.file);
        formData.append('file', file.blob);
        formData.append(
          'info',
          JSON.stringify({
            projectID: e.formData.projectID,
            appletName: e.formData.appletName
          })
        );
        const res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/applet/${e.formData.projectID}`,
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
          projectID: '',
          appletName: 'app_01'
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

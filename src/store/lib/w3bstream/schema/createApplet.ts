import { JSONValue, JSONSchemaModalState, JSONSchemaState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import { definitions } from './definitions';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import FileWidget, { CustomFileWidgetUIOptions } from '@/components/FileWidget';
import { JSONModalValue } from '../../../standard/JSONSchemaState';

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

export class CreateAppletSchema extends JSONSchemaState<SchemaType, any, UiSchema & { file: CustomFileWidgetUIOptions }> {
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
            accept: {
              'application/wasm': ['.wasm']
            },
            tips: `Drag 'n' drop a file here, or click to select a file`
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
          this.modal.set({ show: false });
        }
      },
      value: new JSONValue<SchemaType>({
        //@ts-ignore
        default: {
          projectID: '',
          appletName: 'app_01'
        }
      })
    });
  }

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Applet'
    }
  });
}

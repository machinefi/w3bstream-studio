import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import { definitions } from './definitions';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import FileWidget, { FileWidgetUIOptions } from '@/components/FileWidget';

export const schema = {
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

export class CreateAppletSchema {
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

  form = new JSONSchemaFormState<SchemaType, UiSchema & { file: FileWidgetUIOptions }>({
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
        'ui:widget': FileWidget,
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
        this.form.reset();
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

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Applet',
      autoReset: true
    }
  });
}

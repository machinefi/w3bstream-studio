import FileWidget, { FileWidgetUIOptions } from '@/components/FileWidget';
import { InstanceStatusRender } from '@/components/JSONTableRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { AppletType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import { JSONModalValue, JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import { FromSchema } from 'json-schema-to-ts';
import toast from 'react-hot-toast';
import { definitions } from './definitions';

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

export default class AppletModule {
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
          wasmName: file.name,
          projectID: e.formData.projectID,
          appletName: e.formData.appletName
        })
      );
      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/applet/${e.formData.projectID}`,
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

  table = new JSONSchemaTableState<AppletType>({
    columns: [
      {
        key: 'f_applet_id',
        label: 'Applet ID'
      },
      {
        key: 'f_name',
        label: 'Name'
      },
      {
        key: 'project_name',
        label: 'Project Name'
      },
      {
        key: 'f_wasm_name',
        label: 'Wasm Name'
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                colorScheme: 'blue',
                size: 'xs',
                onClick: () => {
                  if (item.instances.length === 0) {
                    rootStore.w3s.deployApplet.call({ appletID: item.f_applet_id.toString() });
                  } else {
                    toast.success('Deployed');
                  }
                }
              },
              text: 'Deploy'
            }
          ];
        }
      }
    ],
    extendedTables: [
      {
        key: 'instances',
        columns: [
          {
            key: 'f_instance_id',
            label: 'Instance ID'
          },
          {
            key: 'f_state',
            label: 'Status',
            render: InstanceStatusRender
          },
          {
            key: 'actions',
            label: 'Actions',
            actions: (item) => {
              return [
                {
                  props: {
                    bg: '#37A169',
                    color: '#fff',
                    onClick() {
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'START' });
                    }
                  },
                  text: 'Start'
                },
                {
                  props: {
                    ml: '8px',
                    bg: '#FAB400',
                    color: '#fff',
                    onClick() {
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'Restart' });
                    }
                  },
                  text: 'Restart'
                },
                {
                  props: {
                    ml: '8px',
                    bg: '#E53E3E',
                    color: '#fff',
                    onClick() {
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'STOP' });
                    }
                  },
                  text: 'Stop'
                }
              ];
            }
          }
        ]
      },
      {
        key: 'strategies',
        columns: [
          {
            key: 'f_strategy_id',
            label: 'Strategy ID'
          },
          {
            key: 'f_event_type',
            label: 'Event Type'
          },
          {
            key: 'f_handler',
            label: 'handler'
          }
        ]
      }
    ],
    rowKey: 'f_applet_id',
    containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
  });

  allData: AppletType[] = [];

  set(v: Partial<AppletModule>) {
    Object.assign(this, v);
  }
}

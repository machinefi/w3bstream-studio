import FileWidget, { FileWidgetUIOptions } from '@/components/JSONFormWidgets/FileWidget';
import { InstanceStatusRender } from '@/components/JSONTable/FieldRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { hooks } from '@/lib/hooks';
import { AppletType } from '@/server/routers/w3bstream';
import { JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import { FromSchema } from 'json-schema-to-ts';
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
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    appletName: { type: 'string', title: 'Applet Name' }
  },
  required: ['file', 'projectName', 'appletName']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName
};

export default class AppletModule {
  form = new JSONSchemaFormState<SchemaType, UiSchema & { file: FileWidgetUIOptions }>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit',
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
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      //@ts-ignore
      default: {
        projectName: '',
        appletName: 'app_01'
      }
    })
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
          const deleteBtn = {
            props: {
              colorScheme: 'red',
              size: 'xs',
              onClick: async () => {
                globalThis.store.base.confirm.show({
                  title: 'Warning',
                  description: 'Are you sure you want to delete it?',
                  async onOk() {
                    try {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/applet/${item.f_applet_id}`
                      });
                      await showNotification({ message: 'Deleted successfully' });
                      eventBus.emit('applet.delete');
                    } catch (error) {}
                  }
                });
              }
            },
            text: 'Delete'
          };

          const addStrategyBtn = {
            props: {
              ml: '10px',
              colorScheme: 'blue',
              size: 'xs',
              onClick: async () => {
                globalThis.store.w3s.strategy.form.value.set({
                  appletID: item.f_applet_id.toString()
                });
                globalThis.store.w3s.strategy.createStrategy();
              }
            },
            text: 'Add Strategy'
          };

          if (item.instances.length) {
            return [deleteBtn, addStrategyBtn];
          }

          return [
            deleteBtn,
            addStrategyBtn,
            {
              props: {
                ml: '10px',
                colorScheme: 'blue',
                size: 'xs',
                onClick: () => {
                  globalThis.store.w3s.deployApplet.call({ appletID: item.f_applet_id.toString() });
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
                      globalThis.store.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'START' });
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
                      globalThis.store.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'Restart' });
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
                      globalThis.store.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'STOP' });
                    }
                  },
                  text: 'Stop'
                },
                {
                  props: {
                    ml: '8px',
                    colorScheme: 'red',
                    onClick: async () => {
                      globalThis.store.base.confirm.show({
                        title: 'Warning',
                        description: 'Are you sure you want to delete it?',
                        async onOk() {
                          try {
                            await axios.request({
                              method: 'put',
                              url: `/api/w3bapp/deploy/${item.f_instance_id}/REMOVE`
                            });
                            await showNotification({ message: 'Deleted successfully' });
                            eventBus.emit('instance.delete');
                          } catch (error) {}
                        }
                      });
                    }
                  },
                  text: 'Delete'
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

  async createApplet() {
    const formData = await hooks.getFormData({
      title: 'Create Applet',
      size: 'md',
      formList: [
        {
          form: this.form
        }
      ]
    });
    if (formData.file) {
      const data = new FormData();
      const file = dataURItoBlob(formData.file);
      data.append('file', file.blob);
      data.append(
        'info',
        JSON.stringify({
          wasmName: file.name,
          projectName: formData.projectName,
          appletName: formData.appletName
        })
      );
      const res = await axios.request({
        method: 'post',
        url: `/api/file?api=applet/${formData.projectName}`,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data
      });
      if (res.data) {
        await showNotification({ message: 'create applet succeeded' });
        eventBus.emit('applet.create');
      }
    }
  }
}

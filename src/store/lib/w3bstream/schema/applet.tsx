import FileWidget, { FileWidgetUIOptions } from '@/components/JSONFormWidgets/FileWidget';
import { getInstanceButtonStatus, InstanceStatusRender } from '@/components/JSONTable/FieldRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { hooks } from '@/lib/hooks';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
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

export const developerSchema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    file: {
      type: 'string',
      title: 'Upload a wasm file'
    }
  },
  required: ['file']
} as const;

type SchemaType = FromSchema<typeof schema>;
type DeveloperSchemaType = FromSchema<typeof developerSchema>;

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
        submitText: 'Submit'
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

  developerForm = new JSONSchemaFormState<DeveloperSchemaType, UiSchema & { file: FileWidgetUIOptions }>({
    //@ts-ignore
    schema: developerSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
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
      this.developerForm.reset();
    },
    value: new JSONValue<DeveloperSchemaType>()
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
              size: 'xs',
              ...defaultOutlineButtonStyle,
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
              size: 'xs',
              ...defaultButtonStyle,
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
                size: 'xs',
                ...defaultButtonStyle,
                onClick: () => {
                  this.deployApplet({ appletID: item.f_applet_id.toString() });
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
              const buttonStatus = getInstanceButtonStatus(item);
              return [
                {
                  props: {
                    bg: '#37A169',
                    color: '#fff',
                    size: 'xs',
                    isDisabled: buttonStatus.startBtn.isDisabled,
                    onClick() {
                      globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id, event: 'START' });
                    }
                  },
                  text: 'Start'
                },
                {
                  props: {
                    ml: '8px',
                    bg: '#FAB400',
                    color: '#fff',
                    size: 'xs',
                    isDisabled: buttonStatus.restartBtn.isDisabled,
                    onClick() {
                      globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id, event: 'Restart' });
                    }
                  },
                  text: 'Restart'
                },
                {
                  props: {
                    ml: '8px',
                    bg: '#E53E3E',
                    color: '#fff',
                    size: 'xs',
                    isDisabled: buttonStatus.stopBtn.isDisabled,
                    onClick() {
                      globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id, event: 'STOP' });
                    }
                  },
                  text: 'Stop'
                },
                {
                  props: {
                    ml: '8px',
                    size: 'xs',
                    ...defaultOutlineButtonStyle,
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
          },
          {
            key: 'actions',
            label: 'Actions',
            actions: (item) => {
              return [
                {
                  props: {
                    size: 'xs',
                    ...defaultButtonStyle,
                    onClick: async () => {
                      globalThis.store.w3s.strategy.form.value.set({
                        appletID: item.f_applet_id.toString(),
                        eventType: String(item.f_event_type),
                        handler: item.f_handler
                      });
                      const formData = await hooks.getFormData({
                        title: 'Edit Strategy',
                        size: 'md',
                        formList: [
                          {
                            form: globalThis.store.w3s.strategy.form
                          }
                        ]
                      });
                      const { appletID, eventType, handler } = formData;
                      if (appletID && eventType && handler) {
                        const applet = this.allData.find((item) => String(item.f_applet_id) === appletID);
                        try {
                          await axios.request({
                            method: 'put',
                            url: `/api/w3bapp/strategy/x/${applet.project_name}/${item.f_strategy_id}`,
                            data: {
                              appletID,
                              eventType,
                              handler
                            }
                          });
                          await showNotification({ message: 'update strategy succeeded' });
                          eventBus.emit('strategy.update');
                        } catch (error) {}
                      }
                    }
                  },
                  text: 'Edit'
                },
                {
                  props: {
                    ml: '8px',
                    size: 'xs',
                    ...defaultOutlineButtonStyle,
                    onClick() {
                      globalThis.store.base.confirm.show({
                        title: 'Warning',
                        description: 'Are you sure you want to delete it?',
                        async onOk() {
                          const p = globalThis.store.w3s.project.allProjects.value.find((p) => p.f_project_id === item.f_project_id);
                          if (!p) {
                            return;
                          }
                          await axios.request({
                            method: 'delete',
                            url: `/api/w3bapp/strategy/x/${p.f_name}?strategyID=${item.f_strategy_id}`
                          });
                          await showNotification({ message: 'Deleted successfully' });
                          eventBus.emit('strategy.delete');
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
        url: `/api/file?api=applet/x/${formData.projectName}`,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data
      });
      const appletID = res.data?.appletID;
      if (appletID) {
        showNotification({ message: 'create applet succeeded' });
        eventBus.emit('applet.create');
        return appletID;
      }
      return null;
    }
  }

  async deployApplet({ appletID, triggerEvent = true }: { appletID: string; triggerEvent?: boolean }) {
    const res = await axios.request({
      method: 'post',
      url: `/api/w3bapp/deploy/applet/${appletID}`
    });
    const instanceID = res.data?.instanceID;
    if (instanceID) {
      if (triggerEvent) {
        eventBus.emit('instance.deploy');
      }
      return instanceID;
    }
    return null;
  }

  async createAppletForDeveloper({ projectName, appletName = 'applet_1' }: { projectName: string; appletName?: string }) {
    const formData = await hooks.getFormData({
      title: 'Create instance',
      size: 'md',
      formList: [
        {
          form: this.developerForm
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
          projectName,
          appletName,
          wasmName: file.name
        })
      );
      const res = await axios.request({
        method: 'post',
        url: `/api/file?api=applet/x/${projectName}`,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data
      });
      const appletID = res.data?.appletID;
      if (appletID) {
        return appletID;
      }
      return null;
    }
  }

  async updateWASM(appletID, instanceID) {
    const formData = await hooks.getFormData({
      title: 'Update WASM',
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
          appletName: formData.appletName,
          strategies: [{ eventType: 'DEFAULT', handler: 'start' }]
        })
      );
      try {
        const res = await axios.request({
          method: 'put',
          url: `/api/file?api=applet/${appletID}/${instanceID} `,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data
        });
        if (res) {
          showNotification({ message: 'update wasm succeeded' });
          eventBus.emit('applet.update');
        }
      } catch (error) {}
    }
  }
}

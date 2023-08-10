import FileWidget, { FileWidgetUIOptions } from '@/components/JSONFormWidgets/FileWidget';
import { getInstanceButtonStatus, InstanceStatusRender } from '@/components/JSONTable/FieldRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { hooks } from '@/lib/hooks';
import { defaultButtonStyle, defaultOutlineButtonStyle } from '@/lib/theme';
import { trpc } from '@/lib/trpc';
import { AppletType } from '@/server/routers/w3bstream';
import { JSONSchemaFormState, JSONSchemaTableState, JSONValue } from '@/store/standard/JSONSchemaState';
import { PromiseState } from '@/store/standard/PromiseState';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from './definitions';
import InitializationTemplateWidget from '@/components/JSONFormWidgets/InitializationTemplateWidget';
import initTemplates from '@/constants/initTemplates.json';
import toast from 'react-hot-toast';

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
    appletName: { type: 'string', title: 'Applet Name' },
  },
  required: ['file', 'projectName', 'appletName']
} as const;

export const uploadWASMSchema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    template: { type: 'string', title: 'Explore Templates' },
    file: {
      type: 'string',
      title: 'Upload a wasm file'
    }
  },
  required: []
} as const;

type SchemaType = FromSchema<typeof schema>;
type UploadWASMSchemaType = FromSchema<typeof uploadWASMSchema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName
};

export default class AppletModule {
  get curApplet() {
    return globalThis.store.w3s.project.curProject?.applets[0];
  }

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

  uploadWASMForm = new JSONSchemaFormState<UploadWASMSchemaType, UiSchema & { file: FileWidgetUIOptions }>({
    //@ts-ignore
    schema: uploadWASMSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      template: {
        'ui:widget': InitializationTemplateWidget,
        flexProps: {
          h: '200px'
        }
      },
      file: {
        'ui:widget': FileWidget,
        'ui:options': {
          accept: {
            'application/wasm': ['.wasm']
          },
          tips: `Code Upload`,
          flexProps: {
            h: '200px',
            borderRadius: '8px'
          }
        }
      },
      layout: [['template', 'file']]
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.uploadWASMForm.reset();
    },
    value: new JSONValue<UploadWASMSchemaType>({
      //@ts-ignore
      default: {
        template: '',
        file: ''
      },
      onSet(e) {
        const { template, file } = e;
        if (template && template != this.value.template) {
          e.file = '';
        }
        if (file && file != this.value.file) {
          e.template = '';
        }
        return e;
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
                      toast.success('Deleted successfully');
                      eventBus.emit('applet.delete');
                    } catch (error) { }
                  }
                });
              }
            },
            text: 'Delete'
          };

          if (item.instances.length) {
            return [deleteBtn];
          }

          return [
            deleteBtn,
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
                            toast.success('Deleted successfully');
                            eventBus.emit('instance.delete');
                          } catch (error) { }
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
            label: 'Handler'
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
                      const { appletID, eventType, handler,autoCollectMetric } = formData;
                      if (appletID && eventType && handler) {
                        const applet = this.curApplet;
                        try {
                          await axios.request({
                            method: 'put',
                            url: `/api/w3bapp/strategy/x/${applet.project_name}/${item.f_strategy_id}`,
                            data: {
                              appletID,
                              eventType,
                              handler,
                              autoCollectMetric
                            }
                          });
                          toast.success('Updated successfully');
                          eventBus.emit('strategy.update');
                        } catch (error) { }
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
                            url: `/api/w3bapp/strategy/x/${p.name}`,
                            params: {
                              strategyID: item.f_strategy_id
                            }
                          });
                          toast.success('Deleted successfully');
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

  wasmName = new PromiseState<(resourceId) => Promise<any>, string>({
    defaultValue: '',
    function: async (resourceId) => {
      try {
        const res = await trpc.api.wasmName.query({
          resourceId
        });
        return res?.f_filename;
      } catch (error) {
        return '';
      }
    }
  });

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
          appletName: formData.appletName,
          start: true
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
        toast.success('create applet succeeded');
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

  async uploadWASM({ projectName, appletName = 'applet_1', type = 'add', formTitle = '' }: { projectName: string; appletName?: string; type?: 'add' | 'update', formTitle?: string }) {
    let formData = {
      template: '',
      file: ''
    };

    try {
      this.uploadWASMForm.reset();
      formData = await hooks.getFormData({
        title: formTitle,
        size: '2xl',
        formList: [
          {
            form: this.uploadWASMForm
          }
        ]
      });
    } catch (error) {
      this.uploadWASMForm.reset();
      return;
    }

    const appletId = this.curApplet?.f_applet_id;

    if (formData.template) {
      const templateData = initTemplates.templates.find((i) => i.name === formData.template);
      const wasmURL = templateData?.project[0]?.applets[0]?.wasmURL;
      if (!wasmURL) {
        toast.error('This template does not exist.');
        return;
      }
      try {
        const res = await axios.request({
          method: 'post',
          url: `/api/upload-template-file`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            projectName,
            appletName,
            appletId,
            wasmURL,
            uploadType: type
          }
        });
        if (type === 'add') {
          if (res.data?.appletID) {
            eventBus.emit('applet.create');
          }
        }
        if (type === 'update') {
          if (res.data?.resourceID) {
            this.wasmName.call(res.data.resourceID);
            toast.success('update wasm succeeded');
          }
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    if (formData.file) {
      const data = new FormData();
      const file = dataURItoBlob(formData.file);
      data.append('file', file.blob);
      data.append(
        'info',
        JSON.stringify({
          projectName,
          appletName,
          wasmName: file.name,
          start: true
        })
      );

      if (type === 'add') {
        try {
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
            eventBus.emit('applet.create');
          }
        } catch (error) {
          toast.error(error.message)
        }
      }

      if (type === 'update') {
        try {
          const res = await axios.request({
            method: 'put',
            url: `/api/file?api=applet/${appletId}`,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            data
          });
          const resourceID = res.data?.resourceID;
          if (resourceID) {
            this.wasmName.call(resourceID);
            toast.success('update wasm succeeded');
          }
        } catch (error) {
          toast.error(error.message)
        }
      }
    }
  }

  async downloadWasmFile() {
    try {
      const res = await axios.request({
        method: 'get',
        url: `/api/w3bapp/resource/data/${this.curApplet?.f_resource_id}`,
        responseType: 'blob'
      });
      let link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([res.data], { type: "application/wasm" }));
      link.download = this.wasmName.value;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href)
    } catch (error) { }
  }
}

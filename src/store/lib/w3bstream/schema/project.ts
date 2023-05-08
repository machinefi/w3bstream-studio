import { JSONValue, JSONSchemaFormState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import initTemplates from '@/constants/initTemplates.json';
import { makeObservable, observable } from 'mobx';
import { ProjectEnvsWidget } from '@/components/JSONFormWidgets/ProjectEnvs';
import { v4 as uuidv4 } from 'uuid';
import { hooks } from '@/lib/hooks';
import { PromiseState } from '@/store/standard/PromiseState';
import { AppletType, ProjectType, PublisherType, InstanceType, StrategyType } from '@/server/routers/w3bstream';
import { trpc } from '@/lib/trpc';
import InitializationTemplateWidget from '@/components/JSONFormWidgets/InitializationTemplateWidget';
import { dataURItoBlob, UiSchema } from '@rjsf/utils';
import FileWidget, { FileWidgetUIOptions } from '@/components/JSONFormWidgets/FileWidget';
import { InitProject } from 'pages/api/init';
import SelectTagWidget, { SelectTagWidgetUIOptions } from '@/components/JSONFormWidgets/SelectTagWidget';
import { SelectSqlFileAndEnvFileWidget, SelectSqlFileAndEnvFileWidgetUIOptions } from '@/components/JSONFormWidgets/SelectSqlFileAndEnvFileWidget';
import { helper } from '@/lib/helper';

export const defaultSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    envs: { type: 'string', title: '' }
  },
  required: ['name']
} as const;

export const initializationTemplateSchema = {
  type: 'object',
  properties: {
    template: { type: 'string', title: 'Select a template', enum: initTemplates.templates.map((t) => t.name) }
  },
  required: ['template']
} as const;

export const developerInitializationTemplateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    description: { type: 'string', title: 'Description Tags' },
    template: { type: 'string', title: 'Explore Templates' },
    file: { type: 'string', title: 'Code Upload' }
  },
  required: ['name']
} as const;

export const createProjectByWasmSchema = {
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
    projectName: { type: 'string', title: 'Project Name' },
    sqlFileAndEnvFile: {
      type: 'string',
      title: ' '
    }
  },
  required: ['file', 'projectName']
} as const;

export const importProjectSchema = {
  type: 'object',
  properties: {
    json: { type: 'string', title: 'Project File' },
    wasm: { type: 'string', title: 'WASM File' }
  },
  required: []
} as const;

type DefaultSchemaType = FromSchema<typeof defaultSchema>;
type InitializationTemplateSchemaType = FromSchema<typeof initializationTemplateSchema>;
type DeveloperInitializationTemplateSchemaType = FromSchema<typeof developerInitializationTemplateSchema>;
type CreateProjectByWasmSchemaType = FromSchema<typeof createProjectByWasmSchema>;
type ImportProjectSchemaType = FromSchema<typeof importProjectSchema>;

interface OnLoadCompletedProps {
  applets: AppletType[];
  publishers: PublisherType[];
  instances: InstanceType[];
  strategies: StrategyType[];
}

enum ProjectConfigType {
  PROJECT_DATABASE = 1,
  CONFIG_TYPE__INSTANCE_CACHE = 2,
  PROJECT_ENV = 3
}

export default class ProjectModule {
  allProjects = new PromiseState<() => Promise<any>, ProjectType[]>({
    defaultValue: [],
    function: async () => {
      const projects = await trpc.api.projects.query();
      if (projects) {
        const applets = [];
        const instances = [];
        let strategies = [];
        let publishers = [];
        const regex = /(?:[^_]*_){2}(.*)/;
        projects.forEach((p: ProjectType) => {
          const matchArray = p.f_name.match(regex);
          p.name = matchArray ? matchArray[1] : p.f_name;
          p.applets.forEach((a: AppletType) => {
            a.project_name = p.name;
            a.instances.forEach((i) => {
              instances.push({
                project_id: p.f_project_id,
                project_name: p.name,
                applet_id: a.f_applet_id,
                applet_name: a.f_name,
                ...i
              });
            });
            applets.push({
              ...a,
              project_name: p.name
            });
            strategies = strategies.concat(a.strategies);
          });
          p.publishers.forEach((pub) => {
            // @ts-ignore
            pub.project_id = p.f_project_id;
            // @ts-ignore
            pub.project_name = p.name;
            publishers.push(pub);
          });
          p.configs.forEach((config) => {
            // buffer to string cause by prisma client parse error
            config.f_value && (config.f_value = JSON.parse(config.f_value.toString()));
            switch (config.f_type) {
              case ProjectConfigType.PROJECT_DATABASE:
                // @ts-ignore
                p.database = config.f_value;
                break;
              case ProjectConfigType.PROJECT_ENV:
                // @ts-ignore
                p.envs = config.f_value;
                break;
            }
          });
        });
        this.onLoadCompleted({
          applets,
          publishers,
          instances,
          strategies
        });
      }
      return projects;
    }
  });

  form = new JSONSchemaFormState<DefaultSchemaType>({
    //@ts-ignore
    schema: defaultSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      envs: {
        'ui:widget': ProjectEnvsWidget
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    customValidate: (formData, errors) => {
      if (formData.name) {
        const re = /^[a-z0-9_]{6,32}$/;
        if (!re.test(formData.name)) {
          errors.name.addError('field should consist of only lowercase letters, numbers, and underscores, with no spaces; it must be at least 6 characters long and no more than 32.');
        }
      }
      return errors;
    },
    value: new JSONValue<DefaultSchemaType>({
      default: {
        name: 'project_01'
      }
    })
  });

  initializationTemplateForm = new JSONSchemaFormState<InitializationTemplateSchemaType>({
    //@ts-ignore
    schema: initializationTemplateSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.initializationTemplateForm.reset();
    },
    value: new JSONValue<InitializationTemplateSchemaType>({
      default: {
        template: ''
      }
    })
  });

  developerInitializationTemplateForm = new JSONSchemaFormState<DeveloperInitializationTemplateSchemaType, UiSchema & { file: FileWidgetUIOptions; description: SelectTagWidgetUIOptions }>({
    //@ts-ignore
    schema: developerInitializationTemplateSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      description: {
        'ui:widget': SelectTagWidget,
        'ui:options': {
          tags: ['Mobility', 'Energy', 'Environmental', 'Healthcare', 'General', 'Smart City', 'Smart Home', 'Geo-location']
        }
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
      layout: ['name', 'description', ['template', 'file']]
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.developerInitializationTemplateForm.reset();
    },
    customValidate: (formData, errors) => {
      if (formData.name) {
        const re = /^[a-z0-9_]{6,32}$/;
        if (!re.test(formData.name)) {
          errors.name.addError('field should consist of only lowercase letters, numbers, and underscores, with no spaces; it must be at least 6 characters long and no more than 32.');
        }
      }
      return errors;
    },
    value: new JSONValue<DeveloperInitializationTemplateSchemaType>({
      default: {
        name: '',
        description: '',
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

  createProjectByWasmForm = new JSONSchemaFormState<CreateProjectByWasmSchemaType, UiSchema & { file: FileWidgetUIOptions; sqlFileAndEnvFile: SelectSqlFileAndEnvFileWidgetUIOptions }>({
    //@ts-ignore
    schema: createProjectByWasmSchema,
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
          tips: `Drag 'n' drop a file here, or click to select a file`,
          showDownload: true
        }
      },
      sqlFileAndEnvFile: {
        'ui:widget': SelectSqlFileAndEnvFileWidget,
        'ui:options': {
          separator: '<--->'
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.createProjectByWasmForm.reset();
    },
    value: new JSONValue<CreateProjectByWasmSchemaType>({
      //@ts-ignore
      default: {
        projectName: ''
      }
    })
  });

  importProjectForm = new JSONSchemaFormState<ImportProjectSchemaType, UiSchema & { json: FileWidgetUIOptions; wasm: FileWidgetUIOptions }>({
    //@ts-ignore
    schema: importProjectSchema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      json: {
        'ui:widget': FileWidget,
        'ui:options': {
          resultType: 'JSON',
          accept: {
            'application/json': ['.json']
          },
          tips: `Upload a JSON file`,
          flexProps: {
            h: '200px',
            borderRadius: '8px'
          }
        }
      },
      wasm: {
        'ui:widget': FileWidget,
        'ui:options': {
          accept: {
            'application/wasm': ['.wasm']
          },
          tips: `Upload a WASM file`,
          flexProps: {
            h: '100px',
            borderRadius: '8px'
          }
        }
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.importProjectForm.reset();
    },
    customValidate: (formData, errors) => {
      if (!formData.json) {
        errors.json.addError('JSON file is required');
      }
      if (!formData.wasm) {
        errors.wasm.addError('WASM file is required');
      }
      return errors;
    },
    value: new JSONValue<ImportProjectSchemaType>({
      default: {
        json: '',
        wasm: ''
      }
    })
  });

  formMode: 'add' | 'edit' = 'add';
  selectedNames = [];

  get curProject() {
    return this.allProjects.current;
  }

  constructor({
    onLoadCompleted
  }: Partial<{
    onLoadCompleted: (data: OnLoadCompletedProps) => void;
  }> = {}) {
    makeObservable(this, {
      formMode: observable,
      selectedNames: observable
    });

    if (onLoadCompleted) {
      this.onLoadCompleted = onLoadCompleted;
    }
  }

  onLoadCompleted(data: OnLoadCompletedProps) {}

  async createProject() {
    this.setMode('add');
    const formData = await hooks.getFormData({
      title: 'Create Project',
      size: '2xl',
      closeOnOverlayClick: false,
      formList: [
        {
          label: 'Default',
          form: this.form
        },
        {
          label: 'Initialization Template',
          form: this.initializationTemplateForm
        }
      ]
    });
    if (formData.name) {
      try {
        const res = await axios.request({
          method: 'post',
          url: '/api/w3bapp/project',
          data: formData
        });
        if (res.data?.project) {
          eventBus.emit('project.create');
          showNotification({ message: 'create project succeeded' });
        }
      } catch (error) {}
    }
    if (formData.template) {
      const templateData = initTemplates.templates.find((i) => i.name === formData.template);
      const data = JSON.parse(JSON.stringify(templateData));
      const templateProjectName = templateData.project[0].name;
      data.project[0].name = `${templateProjectName}_${uuidv4().slice(0, 4)}`;
      const res = await axios.request({
        method: 'post',
        url: `/api/init`,
        data
      });
      if (res.data) {
        showNotification({ message: 'Create project succeeded' });
        eventBus.emit('project.create');
      }
    }
  }

  async createProjectByWasm() {
    const formData = await hooks.getFormData({
      title: 'Create Project By Wasm',
      size: 'md',
      formList: [
        {
          form: this.createProjectByWasmForm
        }
      ]
    });
    // formData.file
    // {
    //   "name": "mint_nft_template",
    //   "description": "",
    //   "applets": [{ "wasmRaw": "https://raw.githubusercontent.com/machinefi/w3bstream-wasm-ts-sdk/main/examples/wasms/mint_nft.wasm", "appletName": "applet_01" }],
    //   "datas": []
    // }
    if (formData.file && formData.projectName) {
      const projectData: InitProject = {
        name: formData.projectName,
        description: '',
        applets: [{ wasmRaw: formData.file, appletName: 'applet_01' }],
        datas: []
      };
      if (formData.sqlFileAndEnvFile) {
        const [sqlCode, envCode] = formData.sqlFileAndEnvFile.split('<--->');
        if (sqlCode) {
          projectData.database = helper.json.safeParse(sqlCode);
        }
        if (envCode) {
          projectData.envs = helper.json.safeParse(envCode);
        }
      }
      try {
        const res = await axios.request({
          method: 'post',
          url: `/api/init`,
          data: {
            project: [projectData]
          }
        });
        if (res.data) {
          eventBus.emit('project.create');
        }
      } catch (error) {
        console.log('error', error);
        throw new Error(error);
      }
    }
  }

  async createProjectForDeleveloper() {
    let formData = {
      name: '',
      description: '',
      template: '',
      file: ''
    };
    try {
      formData = await hooks.getFormData({
        title: 'Create a New Project',
        size: '2xl',
        closeOnOverlayClick: false,
        formList: [
          {
            form: this.developerInitializationTemplateForm
          }
        ]
      });
    } catch (error) {
      this.developerInitializationTemplateForm.reset();
      return;
    }
    const projectName = formData.name;
    if (formData.template) {
      const templateData = initTemplates.templates.find((i) => i.name === formData.template);
      const data = JSON.parse(JSON.stringify(templateData));
      data.project[0].name = projectName;
      data.project[0].description = formData.description;
      try {
        const res = await axios.request({
          method: 'post',
          url: `/api/init`,
          data
        });
        if (res.data) {
          showNotification({ message: 'Create project succeeded' });
        }
      } catch (error) {}
      eventBus.emit('project.create');
      return;
    }

    try {
      const res = await axios.request({
        method: 'post',
        url: '/api/w3bapp/project',
        data: {
          name: projectName,
          description: formData.description
        }
      });
      if (res.data?.projectID) {
        if (formData.file) {
          const data = new FormData();
          const file = dataURItoBlob(formData.file);
          data.append('file', file.blob);
          data.append(
            'info',
            JSON.stringify({
              projectName,
              appletName: 'applet_01',
              wasmName: file.name,
              start: true
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
          if (res.data) {
            eventBus.emit('project.create');
            showNotification({ message: 'create project succeeded' });
          }
        } else {
          eventBus.emit('project.create');
          showNotification({ message: 'create project succeeded' });
        }
      }
    } catch (error) {
      showNotification({ color: 'red', message: error.message });
    }
  }

  async setMode(mode: 'add' | 'edit') {
    this.formMode = mode;
    if (mode === 'add') {
      this.form.reset();
      this.form.uiSchema['ui:submitButtonOptions'].norender = false;
      this.form.uiSchema.name = {
        'ui:disabled': false
      };
    } else {
      this.form.uiSchema['ui:submitButtonOptions'].norender = true;
      this.form.uiSchema.name = {
        'ui:disabled': true
      };
    }
  }

  selectProjectName(projectName: string, checked: boolean) {
    const index = this.selectedNames.findIndex((i) => i === projectName);
    if (checked && index === -1) {
      this.selectedNames.push(projectName);
    }
    if (!checked && index !== -1) {
      this.selectedNames.splice(index, 1);
    }
  }

  resetSelectedNames() {
    this.selectedNames = [];
  }

  async exportProject() {
    if (globalThis.store.w3s.cronJob.list.value.length === 0) {
      await globalThis.store.w3s.cronJob.list.call(this.curProject?.f_project_id);
    }
    helper.download.downloadJSON(`w3bstream`, {
      name: this.curProject?.name,
      description: this.curProject?.f_description,
      database: this.curProject?.database,
      envs: this.curProject?.envs,
      cronJob: globalThis.store.w3s.cronJob.list.value.map((i) => ({
        eventType: i.f_event_type,
        cronExpressions: i.f_cron_expressions
      })),
      contractLog: globalThis.store.w3s.contractLogs.curProjectContractLogs.map((i) => ({
        eventType: i.f_event_type,
        chainID: Number(i.f_chain_id),
        contractAddress: i.f_contract_address,
        blockStart: Number(i.f_block_start),
        blockEnd: Number(i.f_block_end),
        topic0: i.f_topic0
      })),
      chainHeight: globalThis.store.w3s.chainHeight.curProjectChainHeight.map((i) => ({
        eventType: i.f_event_type,
        chainID: Number(i.f_chain_id),
        height: Number(i.f_height)
      }))
    });
  }

  async importProject() {
    let formData;
    try {
      formData = await hooks.getFormData({
        title: 'Import Project',
        size: '2xl',
        closeOnOverlayClick: false,
        formList: [
          {
            form: this.importProjectForm
          }
        ]
      });
    } catch (error) {
      this.importProjectForm.reset();
      return;
    }
    if (formData.json && formData.wasm) {
      const json = helper.json.safeParse(formData.json);
      try {
        const projectName = json.name;
        const body: any = {
          name: projectName,
          description: json.description
        };
        if (json.database?.schemas) {
          body.database = json.database;
        }
        if (json.envs?.env) {
          body.envs = json.envs;
        }
        const res = await axios.request({
          method: 'post',
          url: '/api/w3bapp/project',
          data: body
        });
        const projectID = res.data?.projectID;
        if (projectID) {
          const data = new FormData();
          const file = dataURItoBlob(formData.wasm);
          data.append('file', file.blob);
          data.append(
            'info',
            JSON.stringify({
              projectName,
              appletName: 'applet_01',
              wasmName: file.name,
              start: true
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
          if (res.data) {
            if (json.cronJob && Array.isArray(json.cronJob)) {
              for (const item of json.cronJob) {
                await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/cronjob/${projectID}`,
                  data: item
                });
              }
            }
            if (json.contractLog && Array.isArray(json.contractLog)) {
              for (const item of json.contractLog) {
                await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/monitor/x/${projectName}/contract_log`,
                  data: item
                });
              }
            }
            if (json.chainHeight && Array.isArray(json.chainHeight)) {
              for (const item of json.chainHeight) {
                await axios.request({
                  method: 'post',
                  url: `/api/w3bapp/monitor/x/${projectName}/chain_height`,
                  data: item
                });
              }
            }
            eventBus.emit('project.create');
            eventBus.emit('contractlog.create');
            eventBus.emit('chainHeight.create');
            showNotification({ message: 'import project succeeded' });
          }
        }
      } catch (error) {}
    }
  }
}

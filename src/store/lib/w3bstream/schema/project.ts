import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import initTemplates from '@/constants/initTemplates.json';
import { makeObservable, observable } from 'mobx';
import { ProjectEnvsWidget } from '@/components/ProjectEnvs';
import { v4 as uuidv4 } from 'uuid';
import { ProjectDBSchemaWidget } from '@/components/ProjectDBSchema';
import EditorWidget from '@/components/EditorWidget';
import { rootStore } from '@/store/index';
import initDBSchema from '@/constants/initDBSchema.json';

export const defaultSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    envs: { type: 'string', title: '' },
    dbSchema: { type: 'string', title: 'Project Database Schema' }
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

type DefaultSchemaType = FromSchema<typeof defaultSchema>;
type InitializationTemplateSchemaType = FromSchema<typeof initializationTemplateSchema>;
interface Env {
  id: string;
  key: string;
  value: string;
}

export default class ProjectModule {
  form = new JSONSchemaFormState<DefaultSchemaType>({
    //@ts-ignore
    schema: defaultSchema,
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
      envs: {
        'ui:widget': ProjectEnvsWidget
      },
      dbSchema: {
        'ui:widget': EditorWidget,
        'ui:options': {
          'readOnly': false,
        }
      }
    },
    afterSubmit: async (e) => {
      try {
        const res = await axios.request({
          method: 'post',
          url: '/api/w3bapp/project',
          data: e.formData
        });
        if (res.data) {
          eventBus.emit('project.create');
          await showNotification({ message: 'create project successed' });
        }
        await this.onSaveEnv();
        await this.onSaveDBSchema();
        this.form.reset();
        this.modal.set({ show: false });
      } catch (error) { }
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
        submitText: 'Submit',
        props: {
          w: '100%',
          h: '32px',
          ...gradientButtonStyle
        }
      }
    },
    afterSubmit: async (e) => {
      const { template } = e.formData;
      const data = initTemplates.templates.find((i) => i.name === template);
      const res = await axios.request({
        method: 'post',
        url: `/api/init?adminKey=iotex.W3B.admin`,
        data
      });
      if (res.data) {
        await showNotification({ message: 'Create project successed' });
        eventBus.emit('project.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<InitializationTemplateSchemaType>({
      default: {
        template: ''
      }
    })
  });

  formMode: 'add' | 'edit' = 'add';

  formList = undefined;
  setFormList() {
    if (this.formMode === 'add') {
      this.formList = [
        {
          label: 'Default',
          form: this.form
        },
        {
          label: 'Initialization Template',
          form: this.initializationTemplateForm
        }
      ];
    } else {
      this.formList = undefined;
    }
  }


  envs: Env[] = [];
  onAddEnv() {
    this.envs.push({
      id: uuidv4(),
      key: '',
      value: ''
    });
  }
  onDeleteEnv(id: string) {
    this.envs = this.envs.filter((i) => i.id !== id);
  }
  onChangeEnv(id: string, key: string, value: string) {
    for (let i = 0; i < this.envs.length; i++) {
      const item = this.envs[i];
      if (item.id === id) {
        item.key = key;
        item.value = value;
        break;
      }
    }
  }
  async setEnvs() {
    if (this.formMode === 'edit') {
      this.envs = globalThis.store.w3s.curProject?.config?.env || [
        {
          id: uuidv4(),
          key: '',
          value: ''
        }
      ];
    } else {
      this.envs = [
        {
          id: uuidv4(),
          key: '',
          value: ''
        }
      ];
    }
  }
  async onSaveEnv() {
    const projectName = this.form.value.get().name;
    const values = this.envs.filter((item) => !!item.key).map((item) => [item.key, item.value]);
    console.log(projectName);
    if (values.length) {
      try {
        await axios.post(`/api/w3bapp/project_config/${projectName}/PROJECT_ENV`, { values });
        await showNotification({ message: 'Save environment variables successfully' });
      } catch (error) {
        throw error;
      }
    }
  }

  async onSaveDBSchema() {
    const projectName = this.form.value.get().name;
    const dbSchema = this.form.value.get().dbSchema;
    console.log(projectName)
    if (!dbSchema) return;
    await axios.post(`/api/w3bapp/project_config/${projectName}/PROJECT_SCHEMA`, dbSchema, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    await showNotification({ message: 'create database successed!' });
  }

  async setMode(mode: 'add' | 'edit') {
    if (mode === 'add') {
      this.form.reset();
      this.form.uiSchema['ui:submitButtonOptions'].norender = false;
      this.form.uiSchema.name = {
        'ui:disabled': false
      };
      this.form.uiSchema.dbSchema['ui:options'].readOnly = false;
      this.form.value.set({
        dbSchema: ""
      })
    } else {
      this.form.uiSchema['ui:submitButtonOptions'].norender = true;
      this.form.uiSchema.name = {
        'ui:disabled': true
      };
      await rootStore.w3s.allProjects.call();
      this.setDBSchema();
    }
    this.formMode = mode;
    this.setFormList();
    this.setEnvs();
  }

  setDBSchema() {
    if (!globalThis.store.w3s.curProject?.config?.schema) {
      this.form.uiSchema.dbSchema['ui:options'].showSubmitButton = true;
      this.form.uiSchema.dbSchema['ui:options'].afterSubmit = (value: string) => {
        this.form.value.set({
          dbSchema: value
        })
        this.onSaveDBSchema();
      }
      this.form.value.set({
        dbSchema: ''
      })
    } else {
      this.form.uiSchema.dbSchema['ui:options'].showSubmitButton = false;
      this.form.uiSchema.dbSchema['ui:options'].readOnly = true;
      this.form.value.set({
        dbSchema: JSON.stringify((globalThis.store.w3s.curProject?.config?.schema), null, 2)
      })
    }
  }

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Project',
      autoReset: true
    }
  });

  constructor() {
    makeObservable(this, {
      envs: observable,
      formMode: observable
    });
  }
}

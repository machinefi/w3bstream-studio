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
          await this.onSaveEnv();
          await showNotification({ message: 'create project successed' });
          eventBus.emit('project.create');
          this.form.reset();
          this.modal.set({ show: false });
        }
      } catch (error) {}
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
        await showNotification({ message: 'create project successed' });
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

  formList = undefined;
  setFormList(mode: 'add' | 'edit') {
    if (mode === 'add') {
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
  async setEnvs(mode: 'add' | 'edit') {
    if (mode === 'edit') {
      this.envs = [];
      const projectName = globalThis.store.w3s.curProject.f_name;
      try {
        const res = await axios.get(`/api/w3bapp/project_config/${projectName}/PROJECT_ENV`);
        if (res.data) {
          this.envs = res.data.values.map((item) => ({
            id: uuidv4(),
            key: item[0],
            value: item[1]
          }));
        }
      } catch (error) {}
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
    if (values.length) {
      try {
        await axios.post(`/api/w3bapp/project_config/${projectName}/PROJECT_ENV`, { values });
        await showNotification({ message: 'Save environment variables successfully' });
      } catch (error) {
        throw error;
      }
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
      envs: observable
    });
  }
}

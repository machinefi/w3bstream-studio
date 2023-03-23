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

interface OnLoadCompletedProps {
  applets: AppletType[];
  publishers: PublisherType[];
  instances: InstanceType[];
  strategies: StrategyType[];
}

export default class ProjectModule {
  allProjects = new PromiseState<() => Promise<any>, ProjectType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.projects.query();
      if (res) {
        const applets = [];
        const instances = [];
        let strategies = [];
        let publishers = [];
        res.forEach((p: ProjectType) => {
          // p.project_files = new FilesListSchema();
          p.applets.forEach((a: AppletType) => {
            a.project_name = p.f_name;
            a.instances.forEach((i) => {
              instances.push({
                project_id: p.f_project_id,
                project_name: p.f_name,
                applet_id: a.f_applet_id,
                applet_name: a.f_name,
                ...i
              });
            });
            applets.push({
              ...a,
              project_name: p.f_name
            });
            strategies = strategies.concat(a.strategies);
          });
          p.publishers.forEach((pub) => {
            // @ts-ignore
            pub.project_id = p.f_project_id;
            // @ts-ignore
            pub.project_name = p.f_name;
            publishers.push(pub);
          });
        });
        // console.log(toJS(res));
        this.onLoadCompleted({
          applets,
          publishers,
          instances,
          strategies
        });
      }
      return res;
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

  formMode: 'add' | 'edit' = 'add';
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
  async setMode(mode: 'add' | 'edit') {
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
    this.formMode = mode;
    this.setEnvs();
  }
  async setEnvs() {
    if (this.formMode === 'edit') {
      this.envs = this.curProject?.config?.env || [
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
    if (values.length) {
      try {
        await axios.post(`/api/w3bapp/project_config/${projectName}/PROJECT_ENV`, { env: values });
        await showNotification({ message: 'Save environment variables successfully' });
      } catch (error) {
        throw error;
      }
    }
  }
  async createProject() {
    this.setMode('add');
    const formData = await hooks.getFormData({
      title: 'Create Project',
      size: '2xl',
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
        if (res.data) {
          eventBus.emit('project.create');
          await showNotification({ message: 'create project succeeded' });
        }
        await this.onSaveEnv();
      } catch (error) {}
    }
    if (formData.template) {
      const data = initTemplates.templates.find((i) => i.name === formData.template);
      const res = await axios.request({
        method: 'post',
        url: `/api/init`,
        data
      });
      if (res.data) {
        await showNotification({ message: 'Create project succeeded' });
        eventBus.emit('project.create');
      }
    }
  }
  async editProject() {
    this.setMode('edit');
    await hooks.getFormData({
      title: 'Project Details',
      size: '2xl',
      formList: [
        {
          form: this.form
        }
      ]
    });
  }

  get curProject() {
    return this.allProjects.current;
  }

  selectedNames = [];
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

  constructor({
    onLoadCompleted
  }: Partial<{
    onLoadCompleted: (data: OnLoadCompletedProps) => void;
  }> = {}) {
    makeObservable(this, {
      envs: observable,
      formMode: observable,
      selectedNames: observable
    });

    if (onLoadCompleted) {
      this.onLoadCompleted = onLoadCompleted;
    }
  }

  onLoadCompleted(data: OnLoadCompletedProps) {}
}

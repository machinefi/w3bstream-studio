import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import initTemplates from '@/constants/initTemplates.json';

export const defaultSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' }
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
      }
    },
    afterSubmit: async (e) => {
      const res = await axios.request({
        method: 'post',
        url: '/api/w3bapp/project',
        data: e.formData
      });
      if (res.data) {
        await showNotification({ message: 'create project successed' });
        eventBus.emit('project.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<DefaultSchemaType>({
      default: {
        name: 'project_01'
      }
    })
  });

  formList = [
    {
      label: 'Default',
      form: this.form
    },
    {
      label: 'Initialization Template',
      form: new JSONSchemaFormState<InitializationTemplateSchemaType>({
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
      })
    }
  ];

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Project',
      autoReset: true
    }
  });
}

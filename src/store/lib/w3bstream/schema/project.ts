import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' }
  },
  required: ['name']
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class ProjectModule {
  form = new JSONSchemaFormState<SchemaType>({
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
    value: new JSONValue<SchemaType>({
      default: {
        name: 'project_01'
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Project',
      autoReset: true
    }
  });
}

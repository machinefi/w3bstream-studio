import { JSONValue, JSONSchemaState, JSONSchemaModalState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { JSONModalValue } from '../../../standard/JSONSchemaState';

export const schema = {
  // title: 'Create Project',
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' }
  },
  required: ['name']
} as const;

type SchemaType = FromSchema<typeof schema>;

export class CreateProjectSchema extends JSONSchemaState<SchemaType> {
  constructor(args: Partial<CreateProjectSchema> = {}) {
    super(args);
    this.init({
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
          url: '/srv-applet-mgr/v0/project',
          data: e.formData
        });
        if (res.data) {
          await showNotification({ message: 'create project successed' });
          eventBus.emit('project.create');
          this.reset().modal.set({ show: false });
        }
      },
      value: new JSONValue<SchemaType>({
        default: {
          name: 'project_01'
        }
      })
    });
  }
  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Project'
    }
  });
}

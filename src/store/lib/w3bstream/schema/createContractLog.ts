import { JSONValue, JSONSchemaFormState, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
    eventType: { type: 'string', title: 'Event Type' },
    chainID: { type: 'number', title: 'Chain ID' },
    contractAddress: { type: 'string', title: 'Contract Address' },
    blockStart: { type: 'number', title: 'Block Start' },
    blockEnd: { type: 'number', title: 'Block End' },
    topic0: { type: 'string', title: 'topic0' }
  },
  required: ['projectID', 'eventType', 'chainID', 'contractAddress', 'blockStart', 'blockEnd', 'topic0']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export class CreateContractLogSchema {
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
        url: `/srv-applet-mgr/v0/monitor/${e.formData.projectID}`,
        data: e.formData
      });
      if (res.data) {
        await showNotification({ message: 'Post blockchain contract event log successed' });
        eventBus.emit('contractlog.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: '',
        eventType: 'DEFAULT',
        chainID: 4690,
        contractAddress: '',
        blockStart: 16737070,
        blockEnd: 16740080,
        topic0: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Post blockchain contract event log',
      autoReset: true
    }
  });
}

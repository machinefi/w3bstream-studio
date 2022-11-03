import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import { ChainTxType } from '@/server/routers/w3bstream';

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
    txAddress: { type: 'string', title: 'txAddress' }
  },
  required: ['projectID', 'eventType', 'chainID', 'txAddress']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export default class ChainTxModule {
  table = new JSONSchemaTableState<ChainTxType>({
    columns: [
      {
        key: 'f_chaintx_id',
        label: 'ChainTx ID'
      },
      {
        key: 'f_project_name',
        label: 'Project Name'
      },
      {
        key: 'f_finished',
        label: 'Finished'
      },
      {
        key: 'f_event_type',
        label: 'Event Type'
      },
      {
        key: 'f_chain_id',
        label: 'Chain ID'
      },
      {
        key: 'f_tx_address',
        label: 'TX Address'
      },
      {
        key: 'f_updated_at',
        label: 'Updated At'
      }
    ],
    rowKey: 'f_chaintx_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });

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
        data: {
          chainTx: e.formData
        }
      });
      if (res.data) {
        await showNotification({ message: 'Post blockchain transaction monitor successed' });
        eventBus.emit('chainTx.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: '',
        eventType: 'DEFAULT',
        chainID: 4690,
        txAddress: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Post blockchain transaction monitor',
      autoReset: true
    }
  });
}

import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import { ChainHeightType } from '@/server/routers/w3bstream';

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
    height: { type: 'number', title: 'Height' },
  },
  required: ['projectID', 'eventType', 'chainID', 'height']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

export default class ChainHeightModule {
  table = new JSONSchemaTableState<ChainHeightType>({
    columns: [
      {
        key: 'f_chain_height_id',
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
        key: 'f_height',
        label: 'Height'
      },
      {
        key: 'f_updated_at',
        label: 'Updated At'
      }
    ],
    rowKey: 'f_chain_height_id',
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
          chainHeight: e.formData
        }
      });
      if (res.data) {
        await showNotification({ message: 'Blockchain height monitor sucessfully created.' });
        eventBus.emit('chainHeight.create');
        this.form.reset();
        this.modal.set({ show: false });
      }
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectID: '',
        eventType: 'DEFAULT',
        chainID: 4690,
        height: 0
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create blockchain height monitor',
      autoReset: true
    }
  });
}

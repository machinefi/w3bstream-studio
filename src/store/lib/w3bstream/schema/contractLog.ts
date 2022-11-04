import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import { gradientButtonStyle } from '@/lib/theme';
import { definitions } from './definitions';
import { ContractLogType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import toast from 'react-hot-toast';

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

export default class ContractLogModule {
  table = new JSONSchemaTableState<ContractLogType>({
    columns: [
      {
        key: 'f_contractlog_id',
        label: 'Contract Log ID'
      },
      {
        key: 'f_project_name',
        label: 'Project Name'
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
        key: 'f_contract_address',
        label: 'Contract Address'
      },
      {
        key: 'f_block_start',
        label: 'Block Start'
      },
      {
        key: 'f_block_current',
        label: 'Block Current'
      },
      {
        key: 'f_block_end',
        label: 'Block End'
      },
      {
        key: 'f_topic0',
        label: 'Topic0'
      },
      {
        key: 'f_updated_at',
        label: 'Updated At'
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                bg: '#E53E3E',
                color: '#fff',
                onClick() {
                  rootStore.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      const project = rootStore.w3s.allProjects.value.find((p) => p.f_name === item.f_project_name);
                      try {
                        await axios.request({
                          method: 'delete',
                          url: `/api/w3bapp/monitor/${project?.f_project_id}`,
                          data: {
                            contractlogID: item.f_contractlog_id
                          }
                        });
                        eventBus.emit('contractlog.delete');
                        toast.success('Deleted successfully');
                      } catch (error) {
                        toast.error('Delete failed');
                      }
                    }
                  });
                }
              },
              text: 'Delete'
            }
          ];
        }
      }
    ],
    rowKey: 'f_contractlog_id',
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
        url: `/api/w3bapp/monitor/${e.formData.projectID}`,
        data: {
          contractLog: e.formData
        }
      });
      if (res.data) {
        await showNotification({ message: 'Smart Contract event monitor successfully created.' });
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
      title: 'Add Smart Contract event monitor',
      autoReset: true
    }
  });
}

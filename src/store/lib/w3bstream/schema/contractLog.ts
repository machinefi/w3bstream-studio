import { JSONValue, JSONSchemaFormState, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ContractLogType } from '@/server/routers/w3bstream';
import { PromiseState } from '@/store/standard/PromiseState';
import { trpc } from '@/lib/trpc';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';
import { defaultOutlineButtonStyle } from '@/lib/theme';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    },
    blockChains: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectName: { $ref: '#/definitions/projects', title: 'Project Name' },
    eventType: { type: 'string', title: 'Event Type' },
    chainID: { $ref: '#/definitions/blockChains', type: 'string', title: 'Chain ID', default: "4690" },
    contractAddress: { type: 'string', title: 'Contract Address' },
    blockStart: { type: 'number', title: 'Block Start' },
    blockEnd: { type: 'number', title: 'Block End' },
    topic0: { type: 'string', title: 'topic0' }
  },
  required: ['projectName', 'eventType', 'chainID', 'contractAddress', 'blockStart', 'blockEnd', 'topic0']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName,
  blockChains: definitions.blockChains
};

export default class ContractLogModule {
  allContractLogs = new PromiseState<() => Promise<any>, ContractLogType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.contractLogs.query();
      if (res) {
        this.table.set({
          dataSource: res
        });
      }
      return res;
    }
  });

  get curProjectContractLogs() {
    const curProjectName = globalThis.store.w3s.project.curProject?.f_name || '';
    return this.allContractLogs.value.filter((c) => c.f_project_name === curProjectName);
  }

  table = new JSONSchemaTableState<ContractLogType>({
    columns: [
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                size: 'xs',
                ...defaultOutlineButtonStyle,
                onClick() {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      try {
                        await axios.request({
                          method: 'delete',
                          url: `/api/w3bapp/monitor/contract_log/${item.f_project_name}/${item.f_contractlog_id}`
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
      },
      {
        key: 'f_contractlog_id',
        label: 'Contract Log ID'
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
      }
    ],
    rowKey: 'f_contractlog_id',
    containerProps: { mt: '10px' }
  });

  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
      },
      chainID: {
        'ui:widget': 'select'
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      default: {
        projectName: '',
        eventType: 'DEFAULT',
        chainID: "4690",
        contractAddress: '',
        blockStart: 16737070,
        blockEnd: 16740080,
        topic0: ''
      }
    })
  });
}

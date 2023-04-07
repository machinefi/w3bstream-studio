import { JSONValue, JSONSchemaFormState, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ChainTxType } from '@/server/routers/w3bstream';
import { PromiseState } from '@/store/standard/PromiseState';
import { trpc } from '@/lib/trpc';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    projectName: { $ref: '#/definitions/projects', title: 'Project ID' },
    eventType: { type: 'string', title: 'Event Type' },
    chainID: { type: 'number', title: 'Chain ID' },
    txAddress: { type: 'string', title: 'txAddress' }
  },
  required: ['projectName', 'eventType', 'chainID', 'txAddress']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName
};

export default class ChainTxModule {
  allChainTx = new PromiseState<() => Promise<any>, ChainTxType[]>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.chainTx.query();
      if (res) {
        this.table.set({
          dataSource: res
        });
      }
      return res;
    }
  });

  get curProjectChainTx() {
    const curProjectName = globalThis.store.w3s.project.curProject?.f_name || '';
    return this.allChainTx.value.filter((c) => c.f_project_name === curProjectName);
  }

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
      },
      // {
      //   key: 'actions',
      //   label: 'Actions',
      //   actions: (item) => {
      //     return [
      //       {
      //         props: {
      //           size: 'xs',
      //           ...defaultOutlineButtonStyle,
      //           onClick() {
      //             globalThis.store.base.confirm.show({
      //               title: 'Warning',
      //               description: 'Are you sure you want to delete it?',
      //               async onOk() {
      //                 try {
      //                   await axios.request({
      //                     method: 'delete',
      //                     url: `/api/w3bapp/monitor/chain_tx/${item.f_project_name}`,
      //                     data: {
      //                       chainTxID: item.f_chaintx_id
      //                     }
      //                   });
      //                   eventBus.emit('chainTx.delete');
      //                   toast.success('Deleted successfully');
      //                 } catch (error) {
      //                   toast.error('Delete failed');
      //                 }
      //               }
      //             });
      //           }
      //         },
      //         text: 'Delete'
      //       }
      //     ];
      //   }
      // }
    ],
    rowKey: 'f_chaintx_id',
    containerProps: { mt: '10px' }
  });

  form = new JSONSchemaFormState<SchemaType>({
    //@ts-ignore
    schema,
    uiSchema: {
      'ui:submitButtonOptions': {
        norender: false,
        submitText: 'Submit'
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
        chainID: 4690,
        txAddress: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: '',
      autoReset: true
    }
  });
}

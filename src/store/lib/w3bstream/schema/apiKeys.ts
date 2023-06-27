import { JSONValue, JSONSchemaFormState, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ContractLogType } from '@/server/routers/w3bstream';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { ethers } from 'ethers';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    expirationDays: { type: 'number', title: 'Expiration Days' },
    description: { type: 'string', title: 'Description' }
  },
  required: ['name', 'expirationDays']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projectName,
  blockChains: definitions.blockChains
};

export default class ApiKeysModule {
  // get curProjectContractLogs() {
  //   return globalThis.store.w3s.project.curProject?.contractLogs || [];
  // }

  table = new JSONSchemaTableState({
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
                onClick() {}
              },
              text: 'Delete'
            }
          ];
        }
      },
      {
        key: 'f_event_type',
        label: 'Name'
      },
      {
        key: 'f_chain_id',
        label: 'Key'
      },
      {
        key: 'f_contract_address',
        label: 'expirationDays'
      },
      {
        key: 'f_block_start',
        label: 'Description'
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
      }
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      default: {
        name: '',
        expirationDays: 30,
        description: ''
      }
    })
  });

  async createApiKey({ name, expirationDays, description }) {
    await axios.request({
      method: 'post',
      url: `/api/w3bapp/access_key`,
      data: { name, expirationDays, description }
    });

    toast.success('Created successfully');
    eventBus.emit('apikey.change');
  }

  async deleteApiKey(name: string) {
    await axios.request({
      method: 'delete',
      url: `/api/w3bapp/access_key/${name}`
    });

    toast.success('Deleted successfully');
    eventBus.emit('apikey.change');
  }
}

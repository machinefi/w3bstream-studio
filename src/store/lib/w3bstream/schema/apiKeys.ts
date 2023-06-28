import { JSONValue, JSONSchemaFormState, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { definitions } from './definitions';
import { ContractLogType, UserSettingType } from '@/server/routers/w3bstream';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { ethers } from 'ethers';
import { PromiseState } from '@/store/standard/PromiseState';
import { Box } from '@chakra-ui/react';
import { helper } from '@/lib/helper';
import { TruncateStringWithCopy } from '@/components/Common/TruncateStringWithCopy';

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
    desc: { type: 'string', title: 'Description' }
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

  table = new JSONSchemaTableState<UserSettingType['apikeys'][0]>({
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
                isLoading: this.deleteApikey.loading.value,
                onClick: () => {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    onOk: async () => {
                      await this.deleteApikey.call(item.f_name);
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
        key: 'f_name',
        label: 'Name'
      },
      {
        key: 'f_access_key',
        label: 'Token',
        render: (item) => {
          return TruncateStringWithCopy({ fullString: item.f_access_key, strLen: 12 });
        }
      },
      {
        key: 'f_expired_at',
        label: 'Expiration',
        render: (item) => {
          return item.f_expired_at ? new Date(Number(item.f_expired_at) * 1000).toLocaleString() : '';
        }
      },
      {
        key: 'f_desc',
        label: 'Description'
      }
    ],
    rowKey: 'f_id',
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
        desc: ''
      }
    })
  });

  createApiKey = new PromiseState({
    function: async (data: { name: string; expirationDays: number; desc: string }) => {
      await axios.request({
        method: 'post',
        url: `/api/w3bapp/access_key`,
        data
      });

      toast.success('Created successfully');
      eventBus.emit('userSetting.change');
    }
  });

  deleteApikey = new PromiseState({
    function: async (name: string) => {
      await axios.request({
        method: 'delete',
        url: `/api/w3bapp/access_key/${name}`
      });

      toast.success('Deleted successfully');
      eventBus.emit('userSetting.change');
    }
  });
}

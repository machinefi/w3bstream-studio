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
      type: 'string',
      get enum() {
        return ['0', '7', '30', '90', '180', '365'];
      },
      get enumNames() {
        return ['Forever', '7 days', '30 days', '90 days', '180 days', '365 days'];
      }
    }
  },
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    expirationDays: { $ref: '#/definitions/projects', title: 'Expiration Days' },
    desc: { type: 'string', title: 'Description' }
  },
  required: ['name', 'expirationDays']
} as const;

type SchemaType = FromSchema<typeof schema>;

// //@ts-ignore
// schema.definitions = {
//   projects: definitions.projectName,
//   blockChains: definitions.blockChains
// };

export default class ApiKeysModule {
  // get curProjectContractLogs() {
  //   return globalThis.store.w3s.project.curProject?.contractLogs || [];
  // }
  apikey = null;

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
        key: 'f_expired_at',
        label: 'Expiration',
        render: (item) => {
          return Number(item.f_expired_at) != 0 ? new Date(Number(item.f_expired_at) * 1000).toLocaleString() : 'Forever';
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
        expirationDays: '0',
        desc: ''
      }
    })
  });

  createApiKey = new PromiseState({
    function: async (data: { name: string; expirationDays: number; desc: string }) => {
      data.expirationDays = Number(data.expirationDays);
      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/account_access_key`,
        data
      });
      console.log(res);
      this.apikey = res.data;
      toast.success('Created successfully');
      eventBus.emit('userSetting.change');
    }
  });

  deleteApikey = new PromiseState({
    function: async (name: string) => {
      await axios.request({
        method: 'delete',
        url: `/api/w3bapp/account_access_key/${name}`
      });

      toast.success('Deleted successfully');
      eventBus.emit('userSetting.change');
    }
  });

  listApikey = new PromiseState({
    function: async () => {
      const res = await axios.request({
        method: 'GET',
        url: `/api/w3bapp/accont_access_key/datalist`
      });
      console.log(res);
      return res;
    }
  });
}

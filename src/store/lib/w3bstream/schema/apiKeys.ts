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
import { useEffect } from 'react';
import PrivilegesWidget from '@/components/JSONFormWidgets/PrivilegesWidget';
import { hooks } from '@/lib/hooks';

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
    // desc: { type: 'string', title: 'Description' },
    privileges: { type: 'string', title: 'Privileges' }
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
  privileges = [];

  set(args: Partial<ApiKeysModule>) {
    Object.assign(this, args);
  }

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
            },
            {
              props: {
                size: 'xs',
                ...defaultOutlineButtonStyle,
                ml: 4,
                isLoading: this.updateApikey.loading.value,
                onClick: async () => {
                  this.privileges = [];
                  const p = helper.json.safeParse(item.f_privileges);
                  for (const i in p) {
                    if (p[i]) {
                      this.privileges.push({
                        name: i,
                        perm: p[i]
                      });
                    }
                  }
                  console.log(this.privileges, Math.floor((Number(item.f_expired_at) - Number(item.f_updated_at)) / 86400).toString());
                  this.form.value.set({
                    name: item.f_name,
                    expirationDays: item.f_expired_at.toString() == '0' ? item.f_expired_at.toString() : Math.floor((Number(item.f_expired_at) - Number(item.f_updated_at)) / 86400).toString()
                  });
                  const formData = await hooks.getFormData({
                    title: 'Update Api Key',
                    size: 'xl',
                    formList: [
                      {
                        form: this.form
                      }
                    ]
                  });
                  const res = await this.updateApikey.call(formData);
                  this.privileges = [];
                }
              },
              text: 'Update'
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
      },
      privileges: {
        'ui:widget': PrivilegesWidget
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
        privileges: ''
      }
    })
  });

  createApiKey = new PromiseState({
    function: async (data: { name: string; expirationDays: number; privileges: any }) => {
      data.expirationDays = Number(data.expirationDays);
      if (!data.privileges) {
        delete data.privileges;
      } else {
        data.privileges = JSON.parse(data.privileges);
      }
      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/account_access_key`,
        data: {
          ...data,
          desc: ''
        }
      });
      console.log(res);
      this.apikey = res.data;
      toast.success('Created successfully');
      eventBus.emit('userSetting.change');
    }
  });

  updateApikey = new PromiseState({
    function: async (data: { name: string; expirationDays: number; privileges: any }) => {
      data.expirationDays = Number(data.expirationDays);
      console.log(data);
      if (!data.privileges) {
        delete data.privileges;
      } else {
        data.privileges = JSON.parse(data.privileges);
      }
      const res = await axios.request({
        method: 'put',
        url: `/api/w3bapp/account_access_key/${data.name}`,
        data: {
          ...data,
          desc: ''
        }
      });
      console.log(res);
      this.apikey = null;
      toast.success('Update successfully');
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

  operatorGrounpMetas = new PromiseState({
    function: async () => {
      const res = await axios.request({
        method: 'GET',
        url: `/api/w3bapp/account_access_key/operator_group_metas`
      });
      console.log(res);
      return res.data;
    }
  });

  use() {
    useEffect(() => {
      this.apikey = null;
      this.operatorGrounpMetas.call();
    }, []);
  }
}

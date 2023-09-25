import { JSONValue, JSONSchemaFormState, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { eventBus } from '@/lib/event';
import { axios } from '@/lib/axios';
import toast from 'react-hot-toast';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { PromiseState } from '@/store/standard/PromiseState';
import { useEffect } from 'react';
import { PaginationState } from '@/store/standard/PaginationState';

export const schema = {
  definitions: {
    types: {
      type: 'number',
      get enum() {
        return [1, 2];
      },
      get enumNames() {
        return ['ECDSA', 'ED25519'];
      }
    }
  },
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    privateKey: { type: 'string', title: 'Private Key' },
    type: { $ref: '#/definitions/types', title: 'Type' },
    // paymasterKey: { type: 'string', title: 'Paymaster Key', description: 'The paymaster key is optional and indicates whether or not the aa Payment in Lieu function is used, and the key issued by the Payment in Lieu service.'}
  },
  required: ['name', 'privateKey', 'type']
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class OperatorModule {
  table = new JSONSchemaTableState<{
    operatorID: string;
    type: 1 | 2;
    address: string;
    name: string;
    accountID: string;
    createdAt: string;
    updatedAt: string;
  }>({
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
                onClick: () => {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    onOk: async () => {
                      await axios.request({
                        method: 'delete',
                        url: `/api/w3bapp/operator/data/${item.operatorID}`
                      });
                      toast.success('Deleted successfully');
                      this.list.call();
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
        key: 'operatorID',
        label: 'Operator ID'
      },
      {
        key: 'name',
        label: 'Name'
      },
      {
        key: 'type',
        label: 'Type',
        render: (item) => {
          return item.type == 1 ? 'ECDSA' : 'ED25519';
        }
      },
      {
        key: 'address',
        label: 'Address'
      }
    ],
    pagination: new PaginationState({
      page: 1,
      limit: 5,
      onPageChange: (currentPage) => {
        this.list.call();
      }
    }),
    isServerPaging: true,
    rowKey: 'operatorID',
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
    },
    afterSubmit: async (e) => {
      eventBus.emit('base.formModal.afterSubmit', e.formData);
      this.form.reset();
    },
    value: new JSONValue<SchemaType>({
      default: {
        name: '',
        privateKey: '',
        type: 1,
        paymasterKey: ''
      }
    })
  });

  createOperator = new PromiseState({
    function: async (formData: { name: string; privateKey: string; type: 1 | 2; paymasterKey?: string }) => {
      const res = await axios.request({
        method: 'post',
        url: `/api/w3bapp/operator`,
        data: formData
      });
      toast.success('Created successfully');
      this.list.call();
      return res;
    }
  });

  list = new PromiseState({
    function: async () => {
      const { page, limit } = this.table.pagination;
      const offset = page * limit - limit;
      const res = await axios.request({
        method: 'get',
        url: `/api/w3bapp/operator/datalist`,
        params: {
          offset,
          size: limit
        }
      });
      const data = res.data;
      if (data?.data) {
        this.table.set({
          dataSource: data.data
        });
        this.table.pagination.setData({
          total: data.total
        });
      }
      return res;
    }
  });

  useOperators() {
    useEffect(() => {
      this.list.call();
    }, []);
  }
}

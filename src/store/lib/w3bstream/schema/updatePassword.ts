import { JSONSchemaState, JSONSchemaModalState, JSONValue } from '@/store/standard/JSONSchemaState';
import { rootStore } from '@/store/index';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  // title: 'Update Password',
  type: 'object',
  properties: {
    password: { type: 'string', title: 'Password' }
  },
  required: ['password']
} as const;

type SchemaType = FromSchema<typeof schema>;

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class UpdatePasswordSchema extends JSONSchemaState<SchemaType, ExtraDataType> {
  constructor(args: Partial<UpdatePasswordSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: false,
          submitText: 'Update',
          props: {
            w: '100%',
            h: '32px',
            ...gradientButtonStyle
          }
        }
      },

      afterSubmit: async (e) => {
        const res = await axios.request({
          method: 'put',
          url: `/srv-applet-mgr/v0/account/${rootStore.w3s.config.formData.accountID}`,
          data: e.formData
        });
        showNotification({ message: 'update password successed' });
        eventBus.emit('user.update-pwd');
        this.reset();
        this.extraValue.set({ modal: { show: false } });
        rootStore.w3s.config.logout();
      },
      value: new JSONValue<SchemaType>({
        default: {
          password: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        //@ts-ignore
        default: {
          modal: { show: false, title: 'Update Password' }
        }
      })
    });
  }
}

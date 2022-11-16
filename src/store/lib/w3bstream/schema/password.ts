import { JSONSchemaFormState, JSONValue, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { rootStore } from '@/store/index';
import { FromSchema } from 'json-schema-to-ts';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  type: 'object',
  properties: {
    password: { type: 'string', title: 'Password' }
  },
  required: ['password']
} as const;

type SchemaType = FromSchema<typeof schema>;

export default class PasswordModule {
  form = new JSONSchemaFormState<SchemaType>({
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
        url: `/api/w3bapp/account/${rootStore.w3s.config.form.formData.accountID}`,
        data: e.formData
      });
      showNotification({ message: 'update password successed' });
      eventBus.emit('user.update-pwd');
      this.form.reset();
      this.modal.set({ show: false });
      rootStore.w3s.config.logout();
    },
    value: new JSONValue<SchemaType>({
      default: {
        password: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Update Password',
      autoReset: true
    }
  });
}

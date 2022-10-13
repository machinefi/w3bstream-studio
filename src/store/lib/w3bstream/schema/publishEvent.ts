import { JSONValue, JSONSchemaState, JSONSchemaModalState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { rootStore } from '@/store/index';
import { showNotification } from '@mantine/notifications';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';

export const schema = {
  title: 'Publish Event',
  type: 'object',
  properties: {
    handler: { type: 'string' },
    data: { type: 'string' }
  },
  required: ['handler', 'data']
} as const;

type SchemaType = FromSchema<typeof schema>;

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class PublishEventSchema extends JSONSchemaState<SchemaType, ExtraDataType> {
  constructor(args: Partial<PublishEventSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: false
        }
      },
      reactive: true,
      afterSubmit: async (e) => {
        const { projectID, appletID, handler, data } = e.formData;
        const res = await axios.request({
          method: 'post',
          url: `/srv-applet-mgr/v0/event/${projectID}/${appletID}/${handler}`,
          headers: {
            publisher: rootStore.w3s.config.formData.accountID,
            'Content-Type': 'text/plain'
          },
          data
        });
        if (res.data) {
          await showNotification({ message: 'publish event successed' });
          eventBus.emit('applet.publish-event');
          this.reset();
          this.setExtraData({
            modal: { show: false }
          });
        }
      },
      value: new JSONValue<SchemaType>({
        default: {
          projectID: '',
          appletID: '',
          handler: 'start',
          data: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        default: {
          modal: { show: false }
        }
      })
    });
  }
}

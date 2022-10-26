import { JSONSchemaModalState, JSONSchemaState, JSONValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '../../../../lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '../../../../lib/event';
import { gradientButtonStyle } from '../../../../lib/theme';

export const schema = {
  // export const configSchema: JSONSchema7 = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
  // title: 'Create Publisher',
  type: 'object',
  properties: {
    projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
    name: { type: 'string', title: 'Name' },
    key: { type: 'string', title: 'Key' }
  },
  required: ['projectID', 'name', 'key']
} as const;

type SchemaType = FromSchema<typeof schema>;

//@ts-ignore
schema.definitions = {
  projects: definitions.projects
};

type ExtraDataType = {
  modal: JSONSchemaModalState;
};

export class CreatePublisherSchema extends JSONSchemaState<SchemaType, ExtraDataType> {
  constructor(args: Partial<CreatePublisherSchema> = {}) {
    super(args);
    this.init({
      //@ts-ignore
      schema,
      uiSchema: {
        'ui:submitButtonOptions': {
          norender: false,
          submitText: 'Submit',
          props: {
            w: '100%',
            h: '32px',
            ...gradientButtonStyle
          }
        }
      },

      afterSubmit: async (e) => {
        const { publisherID, projectName, projectID, name, key } = e.formData;
        let res;
        if (publisherID && projectName) {
          res = await axios.request({
            method: 'put',
            url: `/srv-applet-mgr/v0/publisher/${projectName}/${publisherID}`,
            data: {
              name,
              key
            }
          });
        } else {
          res = await axios.request({
            method: 'post',
            url: `/srv-applet-mgr/v0/publisher/${projectID}`,
            data: {
              name,
              key
            }
          });
        }

        if (publisherID) {
          await showNotification({ message: 'update publisher successed' });
          eventBus.emit('publisher.update');
        } else {
          await showNotification({ message: 'create publisher successed' });
          eventBus.emit('publisher.create');
        }

        this.reset().extraValue.set({ modal: { show: false } });
      },
      value: new JSONValue<SchemaType>({
        default: {
          publisherID: '',
          projectName: '',
          projectID: '',
          name: '',
          key: ''
        }
      }),
      extraValue: new JSONValue<ExtraDataType>({
        default: {
          modal: { show: false, title: 'Create Publisher' }
        }
      })
    });
  }
}

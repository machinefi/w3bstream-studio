import { JSONSchemaFormState, JSONValue, JSONModalValue } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from '@/store/lib/w3bstream/schema/definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';

export const schema = {
  definitions: {
    projects: {
      type: 'string'
    }
  },
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

export class CreatePublisherSchema {
  form = new JSONSchemaFormState<SchemaType>({
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

      this.form.reset();
      this.modal.set({ show: false });
    },
    value: new JSONValue<SchemaType>({
      default: {
        publisherID: '',
        projectName: '',
        projectID: '',
        name: '',
        key: ''
      }
    })
  });

  modal = new JSONModalValue({
    default: {
      show: false,
      title: 'Create Publisher'
    }
  });
}

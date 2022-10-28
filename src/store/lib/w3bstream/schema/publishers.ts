import { PublisherTokenRender } from '@/components/JSONTableRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { PublisherType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import toast from 'react-hot-toast';

export class PublishersSchema {
  table = new JSONSchemaTableState<PublisherType>({
    columns: [
      {
        key: 'f_publisher_id',
        label: 'Publisher ID'
      },
      {
        key: 'f_name',
        label: 'name'
      },
      {
        key: 'f_key',
        label: 'Key'
      },
      {
        key: 'f_created_at',
        label: 'created at'
      },
      {
        key: 'f_token',
        label: 'token',
        render: PublisherTokenRender
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                bg: '#37A169',
                color: '#fff',
                onClick() {
                  rootStore.w3s.createPublisher.form.value.set({
                    publisherID: item.f_publisher_id,
                    projectName: item.project_name,
                    projectID: item.project_id,
                    name: item.f_name,
                    key: item.f_key
                  });
                  rootStore.w3s.createPublisher.modal.set({ show: true, title: 'Edit Publisher' });
                }
              },
              text: 'Edit'
            },
            {
              props: {
                ml: '8px',
                bg: '#E53E3E',
                color: '#fff',
                onClick() {
                  rootStore.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      await axios.request({
                        method: 'delete',
                        url: `/srv-applet-mgr/v0/publisher/${item.project_name}?publisherID=${item.f_publisher_id}`
                      });
                      eventBus.emit('strategy.delete');
                      toast.success('Deleted successfully');
                    }
                  });
                }
              },
              text: 'Delete'
            }
          ];
        }
      }
    ],
    rowKey: 'f_publisher_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });

  constructor(args: Partial<JSONSchemaTableState<PublisherType>> = {}) {
    Object.assign(this, args);
  }
}

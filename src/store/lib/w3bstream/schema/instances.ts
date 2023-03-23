import { getInstanceButtonStatus, InstanceStatusRender } from '@/components/JSONTable/FieldRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { InstanceType } from '@/server/routers/w3bstream';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { showNotification } from '@mantine/notifications';

export default class InstancesModule {
  table = new JSONSchemaTableState<InstanceType>({
    columns: [
      {
        key: 'f_state',
        label: 'Status',
        render: InstanceStatusRender
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          const buttonStatus = getInstanceButtonStatus(item);
          return [
            {
              props: {
                bg: '#37A169',
                color: '#fff',
                size: 'xs',
                isDisabled: buttonStatus.startBtn.isDisabled,
                onClick() {
                  this.handleInstance({ instaceID: item.f_instance_id.toString(), event: 'START' });
                }
              },
              text: 'Start'
            },
            {
              props: {
                ml: '8px',
                bg: '#FAB400',
                color: '#fff',
                size: 'xs',
                isDisabled: buttonStatus.restartBtn.isDisabled,
                onClick() {
                  this.handleInstance({ instaceID: item.f_instance_id.toString(), event: 'Restart' });
                }
              },
              text: 'Restart'
            },
            {
              props: {
                ml: '8px',
                bg: '#E53E3E',
                color: '#fff',
                size: 'xs',
                isDisabled: buttonStatus.stopBtn.isDisabled,
                onClick() {
                  this.handleInstance({ instaceID: item.f_instance_id.toString(), event: 'STOP' });
                }
              },
              text: 'Stop'
            }
          ];
        }
      },
      {
        key: 'f_instance_id',
        label: 'Instance ID'
      },
      {
        key: 'project_name',
        label: 'Project Name'
      },
      {
        key: 'applet_name',
        label: 'Applet Name'
      },
      {
        key: 'tail-actions',
        label: 'Actions',
        actions: (item) => {
          return [
            {
              props: {
                colorScheme: 'red',
                size: 'xs',
                onClick: async () => {
                  globalThis.store.base.confirm.show({
                    title: 'Warning',
                    description: 'Are you sure you want to delete it?',
                    async onOk() {
                      try {
                        await axios.request({
                          method: 'put',
                          url: `/api/w3bapp/deploy/${item.f_instance_id}/REMOVE`
                        });
                        await showNotification({ message: 'Deleted successfully' });
                        eventBus.emit('instance.delete');
                      } catch (error) {}
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
    rowKey: 'f_instance_id',
    containerProps: { h: 'calc(100vh - 160px)' }
  });

  constructor(args: Partial<JSONSchemaTableState<InstanceType>> = {}) {
    Object.assign(this, args);
  }

  async handleInstance({ instaceID, event }: { instaceID: string; event: string }) {
    const res = await axios.request({
      method: 'put',
      url: `/api/w3bapp/deploy/${instaceID}/${event}`
    });
    eventBus.emit('instance.handle');
    return res.data;
  }
}

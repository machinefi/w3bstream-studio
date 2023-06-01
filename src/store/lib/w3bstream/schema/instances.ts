import { getInstanceButtonStatus, InstanceStatusRender } from '@/components/JSONTable/FieldRender';
import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { defaultOutlineButtonStyle } from '@/lib/theme';
import { InstanceType } from '@/server/routers/w3bstream';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import toast from 'react-hot-toast';

export default class InstancesModule {
  get curInstance() {
    return globalThis.store.w3s.project.curApplet?.instances[0];
  }

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
                  globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id.toString(), event: 'START' });
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
                  globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id.toString(), event: 'Restart' });
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
                  globalThis.store.w3s.instances.handleInstance({ instanceID: item.f_instance_id.toString(), event: 'STOP' });
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
                size: 'xs',
                ...defaultOutlineButtonStyle,
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
                        toast.error('Deleted successfully');
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

  async handleInstance({ instanceID, event }: { instanceID: string; event: string }) {
    const res = await axios.request({
      method: 'put',
      url: `/api/w3bapp/deploy/${instanceID}/${event}`
    });
    eventBus.emit('instance.handle');
    return res.data;
  }
}

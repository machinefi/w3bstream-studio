import { InstanceStatusRender } from '@/components/JSONTableRender';
import { InstanceType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';

export  default class InstancesModule {
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
          return [
            {
              props: {
                bg: '#37A169',
                color: '#fff',
                onClick() {
                  rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id.toString(), event: 'START' });
                }
              },
              text: 'Start'
            },
            {
              props: {
                ml: '8px',
                bg: '#FAB400',
                color: '#fff',
                onClick() {
                  rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id.toString(), event: 'Restart' });
                }
              },
              text: 'Restart'
            },
            {
              props: {
                ml: '8px',
                bg: '#E53E3E',
                color: '#fff',
                onClick() {
                  rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id.toString(), event: 'STOP' });
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
      }
    ],
    rowKey: 'f_instance_id',
    containerProps: { h: 'calc(100vh - 160px)' }
  });

  constructor(args: Partial<JSONSchemaTableState<InstanceType>> = {}) {
    Object.assign(this, args);
  }
}

import { InstanceStatusRender } from '@/components/JSONTableRender';
import { AppletType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import copy from 'copy-to-clipboard';
import toast from 'react-hot-toast';

export class AppletsSchema {
  table = new JSONSchemaTableState<AppletType>({
    columns: [
      {
        key: 'f_applet_id',
        label: 'Applet ID'
      },
      {
        key: 'f_name',
        label: 'Name'
      },
      {
        key: 'project_name',
        label: 'Project Name'
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: (item) => {
          if (item.instances.length > 0) {
            return [
              {
                props: {
                  bg: '#6FB2FF',
                  color: '#fff',
                  onClick() {
                    rootStore.w3s.curPublisherProjectID = item.f_project_id.toString();
                    rootStore.w3s.publishEvent.form.value.set({
                      projectName: item.project_name
                    });
                    rootStore.w3s.publishEvent.modal.set({
                      show: true
                    });
                  }
                },
                text: 'Send Event'
              },
              {
                props: {
                  ml: '8px',
                  variant: 'outline',
                  borderColor: '#6FB2FF',
                  color: '#6FB2FF',
                  onClick() {
                    copy(`curl --location --request POST 'localhost:8888/srv-applet-mgr/v0/event/${item.project_name}' --header 'Content-Type: text/plain' --data-raw '{"payload":"xxx yyy zzz"}'`);
                    toast.success('Copied');
                  }
                },
                text: 'Copy'
              }
            ];
          }
          return [
            {
              props: {
                colorScheme: 'blue',
                size: 'xs',
                onClick: () => {
                  if (item.instances.length === 0) {
                    rootStore.w3s.deployApplet.call({ appletID: item.f_applet_id.toString() });
                  }
                }
              },
              text: 'Deploy'
            }
          ];
        }
      }
    ],
    extendedTables: [
      {
        key: 'instances',
        columns: [
          {
            key: 'f_instance_id',
            label: 'Instance ID'
          },
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
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'START' });
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
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'Restart' });
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
                      rootStore.w3s.handleInstance.call({ instaceID: item.f_instance_id, event: 'STOP' });
                    }
                  },
                  text: 'Stop'
                }
              ];
            }
          }
        ]
      },
      {
        key: 'strategies',
        columns: [
          {
            key: 'f_strategy_id',
            label: 'Strategy ID'
          },
          {
            key: 'f_event_type',
            label: 'Event Type'
          },
          {
            key: 'f_handler',
            label: 'handler'
          }
        ]
      }
    ],
    rowKey: 'f_applet_id',
    containerProps: { mt: 4, h: 'calc(100vh - 200px)', overflowY: 'auto' }
  });

  constructor(args: Partial<JSONSchemaTableState<AppletType>> = {}) {
    Object.assign(this, args);
  }
}

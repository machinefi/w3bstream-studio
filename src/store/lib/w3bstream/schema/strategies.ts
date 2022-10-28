import { axios } from '@/lib/axios';
import { eventBus } from '@/lib/event';
import { StrategyType } from '@/server/routers/w3bstream';
import { rootStore } from '@/store/index';
import { JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import toast from 'react-hot-toast';

export class StrategiesSchema {
  table = new JSONSchemaTableState<StrategyType>({
    columns: [
      {
        key: 'f_strategy_id',
        label: 'Strategy ID'
      },
      {
        key: 'f_applet_id',
        label: 'Applet ID'
      },
      {
        key: 'f_project_id',
        label: 'Project ID'
      },
      {
        key: 'f_event_type',
        label: 'Event Type',
        render: (item) => 'Any'
      },
      {
        key: 'f_handler',
        label: 'handler'
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
                  rootStore.w3s.createStrategy.form.value.set({
                    strategyID: item.f_strategy_id,
                    appletID: item.f_applet_id.toString(),
                    eventType: String(item.f_event_type),
                    handler: item.f_handler
                  });
                  rootStore.w3s.createStrategy.modal.set({ show: true, title: 'Edit Strategy' });
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
                      const p = rootStore.w3s.allProjects.value.find((p) => p.f_project_id === item.f_project_id);
                      if (!p) {
                        return;
                      }
                      await axios.request({
                        method: 'delete',
                        url: `/srv-applet-mgr/v0/strategy/${p.f_name}?strategyID=${item.f_strategy_id}`
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
    rowKey: 'f_strategy_id',
    containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
  });

  constructor(args: Partial<JSONSchemaTableState<StrategyType>> = {}) {
    Object.assign(this, args);
  }
}

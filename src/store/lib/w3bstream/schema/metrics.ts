import { JSONMetricsView } from '@/components/JSONMetricsView';
import { PromiseState } from '@/store/standard/PromiseState';
import axios from 'axios';
import { makeObservable, observable } from 'mobx';
import dayjs from 'dayjs';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import { MappingState } from '@/store/standard/MappingState';
import { TimeRangePick } from '@/components/JSONMetricsView/TimeRangePick';

export type Metrics = {
  metric: {
    project: string;
    [key: string]: any;
  };
  values: [number, string][];
};

export default class MetricsModule {
  dbState = new PromiseState<() => Promise<any>, any>({
    defaultValue: {
      usedSize: 0
    },
    function: async () => {
      try {
        const res = await trpc.pg.dbState.query({
          projectID: globalThis.store.w3s.project.curProject?.f_project_id
        });
        if (!res.errorMsg) {
          return {
            usedSize: res.usedSize
          };
        }
        return {
          usedSize: 0
        };
      } catch (error) {
        return {
          usedSize: 0
        };
      }
    }
  });

  timeRangePick: { data: TimeRangePick } = {
    data: {
      // props: {},
      value: 'day',
      onChange: (value: 'day' | 'week' | 'month') => {
        const now = dayjs();
        // now.setMinutes(0);
        // now.setSeconds(0);
        // now.setMilliseconds(0);

        this.timeconfig.setCurrentId(value);
        //@ts-ignore
        this.timeRangePick.data.value = value;

        const { step } = this.timeconfig.current;

        const startTime = now.subtract(1, this.timeconfig.currentId).unix();
        const endTime = now.unix();

        this.activeDevices.call(startTime, endTime, step);
        this.dataMessages.call(startTime, endTime, step);
        this.blockchainTransaction.call(startTime, endTime, step);
      }
    }
  };

  timeconfig = new MappingState({
    currentId: 'day',
    map: {
      hour: {
        tickValues: 'every 10 minutes',
        step: '14',
        axisBottomFormat: '%H:%M'
      },
      day: {
        tickValues: 'every 6 hours',
        step: '345',
        axisBottomFormat: '%H:%M'
      },
      week: {
        tickValues: 'every 1 days',
        step: '2419',
        axisBottomFormat: '%Y-%m-%d'
      },
      month: {
        tickValues: 'every 1 days',
        step: '9676',
        axisBottomFormat: '%Y-%m-%d'
      }
    }
  });

  get projectName() {
    // return 'eth_0x8a68e01add9adc8b887025dc54c36cfa91432f58_pperf2';
    return globalThis.store.w3s.project.curProject.f_name;
  }

  // TODO: cache 1m
  activeDevices = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime: number, endTime: number, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `count(count_over_time(inbound_events_metrics{project="${this.projectName}"}[1d])) by (project)`,
            start: startTime,
            end: endTime,
            step
          }
        });
        return data.data.result;
      } catch (error) {
        return [];
      }
    }
  });

  dataMessages = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime: number, endTime: number, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (inbound_events_metrics{project="${this.projectName}"})`,
            start: startTime,
            end: endTime,
            step
          }
        });
        return data.data.result;
      } catch (error) {
        return [];
      }
    }
  });

  blockchainTransaction = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime: number, endTime: number, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (w3b_blockchain_tx_metrics{project="${this.projectName}"})`,
            start: startTime,
            end: endTime,
            step
          }
        });
        return data.data.result;
      } catch (error) {
        return [];
      }
    }
  });

  get activeDevicesMetrics(): JSONMetricsView {
    const values = this.activeDevices.value[0]?.values || [];
    let list = values
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((i) => ({ date: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), 'Active Devices': Number(i[1]) }));
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Active Devices',
        description: 'Number of unique devices that sent at least one message to this project',
        data: list
      }
    };
  }

  get dataMessagesMetrics(): JSONMetricsView {
    const values = this.dataMessages.value[0]?.values || [];
    let list = values
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((i) => ({ date: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), 'Data Messages': Number(i[1]) }));
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Data Messages',
        description: 'Total number of messages received from all devices',
        data: list
      }
    };
  }

  get blockchainTransactionMetrics(): JSONMetricsView {
    const values = this.blockchainTransaction.value[0]?.values || [];
    let list = values
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((i) => ({ date: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), 'Blockchain Transaction': Number(i[1]) }));
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Blockchain Transaction',
        description: `Total number of blockchain transactions sent by the project's applet.`,
        data: list
      }
    };
  }

  get dataBaseMetrics(): JSONMetricsView {
    return {
      type: 'ProgressCard',
      data: {
        title: 'Database usage',
        data: [
          {
            title: 'Database size',
            currentValue: this.dbState.value?.usedSize,
            total: 512,
            unit: 'MB'
          }
        ]
      }
    };
  }

  showContent: 'DATABASE' | 'API' = 'API';

  get metricsData() {
    if (this.showContent === 'DATABASE') {
      return [this.dataBaseMetrics];
    }

    if (this.showContent === 'API') {
      return [this.activeDevicesMetrics, this.dataMessagesMetrics, this.blockchainTransactionMetrics, this.dataBaseMetrics];
    }

    return [];
  }

  constructor() {
    makeObservable(this, {
      showContent: observable
    });
  }

  use() {
    useEffect(() => {
      //@ts-ignore
      this.timeRangePick.data.onChange('hour');
      this.dbState.call();

      return () => {};
    }, []);
  }
}

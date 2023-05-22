import { JSONMetricsView } from '@/components/JSONMetricsView';
import { PromiseState } from '@/store/standard/PromiseState';
import axios from 'axios';
import { makeObservable, observable } from 'mobx';
import dayjs from 'dayjs';
import { trpc } from '@/lib/trpc';

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

  timeRangePick: JSONMetricsView = {
    type: 'TimeRangePick',
    data: {
      props: {},
      onChange: (startTime: Date, endTime: Date, step: number) => {
        this.activeDevices.call(startTime, endTime, step);
        this.dataMessages.call(startTime, endTime, step);
        this.blockchainTransaction.call(startTime, endTime, step);
      }
    }
  };

  activeDevices = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime = new Date(new Date().setDate(new Date().getDate() - 1)), endTime = new Date(), step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `count(count_over_time(inbound_events_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"}[1d])) by (project)`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            step: `${step}s`
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
    function: async (startTime = new Date(new Date().setDate(new Date().getDate() - 1)), endTime = new Date(), step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (inbound_events_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"})`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            step: `${step}s`
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
    function: async (startTime = new Date(new Date().setDate(new Date().getDate() - 1)), endTime = new Date(), step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (w3b_blockchain_tx_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"})`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            step: `${step}s`
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
      .map((i) => ({ x: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), y: Number(i[1]) }));
    if (list.length === 1) {
      const d = dayjs(list[0][0]);
      list = [{ x: d.subtract(8, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Active Devices',
        description: 'Number of unique devices that sent at least one message to this project',
        data: [
          {
            id: 'activeDevicesMetrics',
            data: list
          }
        ],
        xFormat: 'time:%Y-%m-%d %H:%M',
        xScale: {
          type: 'time',
          format: '%Y-%m-%d %H:%M',
          useUTC: false,
          precision: 'millisecond'
        },
        axisBottom: {
          format: '%H:%M',
          tickValues: 'every 4 hours',
          legend: ' ',
          legendPosition: 'middle'
        }
      }
    };
  }

  get dataMessagesMetrics(): JSONMetricsView {
    const values = this.dataMessages.value[0]?.values || [];
    let list = values
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((i) => ({ x: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), y: Number(i[1]) }));
    if (list.length === 1) {
      const d = dayjs(list[0][0]);
      list = [{ x: d.subtract(8, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Data Messages',
        description: 'Total number of messages received from all devices',
        data: [
          {
            id: 'dataMessagesMetrics',
            data: list
          }
        ],
        xFormat: 'time:%Y-%m-%d %H:%M',
        xScale: {
          type: 'time',
          format: '%Y-%m-%d %H:%M',
          useUTC: false,
          precision: 'millisecond'
        },
        axisBottom: {
          format: '%H:%M',
          tickValues: 'every 4 hours',
          legend: ' ',
          legendPosition: 'middle'
        }
      }
    };
  }

  get blockchainTransactionMetrics(): JSONMetricsView {
    const values = this.blockchainTransaction.value[0]?.values || [];
    let list = values
      .slice()
      .sort((a, b) => a[0] - b[0])
      .map((i) => ({ x: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), y: Number(i[1]) }));
    if (list.length === 1) {
      const d = dayjs(list[0][0]);
      list = [{ x: d.subtract(8, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Blockchain Transaction',
        description: `Total number of blockchain transactions sent by the project's applet.`,
        data: [
          {
            id: 'blockchainTransactionMetrics',
            data: list
          }
        ],
        xFormat: 'time:%Y-%m-%d %H:%M',
        xScale: {
          type: 'time',
          format: '%Y-%m-%d %H:%M',
          useUTC: false,
          precision: 'millisecond'
        },
        axisBottom: {
          format: '%H:%M',
          tickValues: 'every 4 hours',
          legend: ' ',
          legendPosition: 'middle'
        }
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
      return [this.timeRangePick, this.activeDevicesMetrics, this.dataMessagesMetrics, this.blockchainTransactionMetrics];
    }

    return [];
  }

  constructor() {
    makeObservable(this, {
      showContent: observable
    });
  }
}

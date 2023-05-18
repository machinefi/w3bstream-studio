import { JSONMetricsView } from '@/components/JSONMetricsView';
import { PromiseState } from '@/store/standard/PromiseState';
import axios from 'axios';
import { makeObservable, observable } from 'mobx';
import dayjs from 'dayjs';
import { trpc } from '@/lib/trpc';

export enum MetricsLabel {
  activeDevicesMetrics = 'publishers_metrics',
  dataMessagesMetrics = 'inbound_events_metrics',
  blockchainTransactionMetrics = 'blockchain_tx_metrics'
}

export type Metrics = {
  metric: {
    __name__: MetricsLabel;
    project: string;
    [key: string]: any;
  };
  values: [number, string][];
};

export default class MetricsModule {
  allMetrics = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime = new Date(new Date().setDate(new Date().getDate() - 1)), endTime = new Date(), step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `{project="${globalThis.store.w3s.project.curProject.f_name}"}`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            step: `${step}s`
          }
        });
        console.log('allMetrics: ', data);
        return data.data.result;
      } catch (error) {
        return [];
      }
    }
  });

  dbState = new PromiseState<() => Promise<any>, any>({
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
        this.allMetrics.call(startTime, endTime, step);
      }
    }
  };

  get activeDevicesMetrics(): JSONMetricsView {
    let values = [];
    const _activeDevicesMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.activeDevicesMetrics);
    _activeDevicesMetrics.forEach((i) => (values = values.concat(i.values)));
    return {
      type: 'LineChartCard',
      data: {
        title: 'Active Devices',
        description: 'Number of uniaue devices that sent at least one message to this project',
        data: [
          {
            id: 'activeDevicesMetrics',
            color: 'hsl(0, 100%, 50%)',
            data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ x: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), y: i[1] }))
          }
        ]
      }
    };
  }

  get dataMessagesMetrics(): JSONMetricsView {
    let values = [];
    const _dataMessagesMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.dataMessagesMetrics);
    _dataMessagesMetrics.forEach((i) => (values = values.concat(i.values.map((t) => [t[0], t[1], i.metric.publisher]))));
    return {
      type: 'LineChartCard',
      data: {
        title: 'Data Messages',
        description: 'Total number of messages received from all devices',
        data: [
          {
            id: 'dataMessagesMetrics',
            color: 'hsl(0, 100%, 50%)',
            data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ x: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), y: i[1] }))
          }
        ]
      }
    };
  }

  get blockchainTransactionMetrics(): JSONMetricsView {
    let values = [];
    const _blockchainTransactionMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.blockchainTransactionMetrics);
    _blockchainTransactionMetrics.forEach((i) => (values = values.concat(i.values)));
    return {
      type: 'LineChartCard',
      data: {
        title: 'Blockchain Transaction',
        description: `Total number of blockchain transactions sent by the project's applet.`,
        data: [
          {
            id: 'blockchainTransactionMetrics',
            color: 'hsl(0, 100%, 50%)',
            data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ x: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), y: i[1] }))
          }
        ]
      }
    };
  }

  get dataBaseMetrics(): JSONMetricsView {
    const _dbMetrics = this.dbState.value;
    return {
      type: 'ProgressCard',
      data: {
        title: 'Database usage',
        data: [
          {
            title: 'Database size',
            currentValue: _dbMetrics?.usedSize,
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

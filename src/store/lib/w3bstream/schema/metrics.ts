import { JSONMetricsView } from '@/components/JSONMetricsView';
import { PromiseState } from '@/store/standard/PromiseState';
import axios from 'axios';
import { makeObservable, observable } from 'mobx';
import dayjs from 'dayjs';
import { trpc } from '@/lib/trpc';
import { rootStore } from '@/store/index';

export enum MetricsLabel {
  w3b_register_publisher_metrics = 'w3b_register_publisher_metrics',
  w3b_receive_event_metrics = 'w3b_receive_event_metrics',
  w3b_blockchain_tx_metrics = 'w3b_blockchain_tx_metrics'
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
            query: `{project="${rootStore.w3s.project.curProject.name}"}`,
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

  dbState = new PromiseState<() => Promise<any>, any>({
    function: async () => {
      try {
        const res = await trpc.pg.dbState.query({
          projectID: rootStore.w3s.project.curProject?.f_project_id
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

  get publisherMetrics(): JSONMetricsView {
    let values = [];
    const _publisherMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.w3b_register_publisher_metrics);
    _publisherMetrics.forEach((i) => (values = values.concat(i.values)));
    console.log(values);
    return {
      type: 'LineChartCard',
      data: {
        title: 'Publisher Metrics',
        // @ts-ignore
        data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ name: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), value: i[1] }))
      }
    };
  }

  get eventMetrics(): JSONMetricsView {
    let values = []; //[time,value,publisher]
    const _publisherMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.w3b_receive_event_metrics);
    _publisherMetrics.forEach((i) => (values = values.concat(i.values.map((t) => [t[0], t[1], i.metric.publisher]))));
    console.log(values);
    return {
      type: 'LineChartCard',
      data: {
        title: 'Event Metrics',
        // @ts-ignore
        data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ name: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), value: i[1], extraData: { publisher: i[2] } }))
      }
    };
  }

  get blockchainMetrics(): JSONMetricsView {
    let values = []; //[time,value,publisher]
    const _publisherMetrics = this.allMetrics.value?.filter((i) => i.metric.__name__ === MetricsLabel.w3b_blockchain_tx_metrics);
    _publisherMetrics.forEach((i) => (values = values.concat(i.values)));
    console.log(values);
    return {
      type: 'LineChartCard',
      data: {
        title: 'Blockchain tx Metrics',
        // @ts-ignore
        data: values.sort((a, b) => a[0] - b[0]).map((i) => ({ name: dayjs(i[0] * 1000).format('MMM DD, YYYY, hh:mmA'), value: i[1] }))
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
      return [this.timeRangePick, this.publisherMetrics, this.eventMetrics, this.blockchainMetrics];
    }

    return [];
  }

  constructor() {
    makeObservable(this, {
      showContent: observable
    });
  }
}

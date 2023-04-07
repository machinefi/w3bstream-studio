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
      const { data } = await axios.request({
        method: 'GET',
        url: `/api/metrics/query_range?query={project=%22${rootStore.w3s.project.curProject.f_name}%22}&start=${startTime.toISOString()}&end=${endTime.toISOString()}&step=${step}s`
      });
      console.log(data.data.result);
      return data.data.result;
    }
  });

  allDBState = new PromiseState<() => Promise<any>, any>({
    defaultValue: [],
    function: async () => {
      const res = await trpc.api.dbState.query();
      console.log(res);
      return res;
    }
  });

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
    const _dbMetrics = this.allDBState.value;
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
          // {
          //   title: 'Database agress',
          //   currentValue: _dbMetrics?.agress,
          //   total: 2,
          //   unit: 'GB'
          // }
        ]
      }
    };
  }

  // databaseMetrics: JSONMetricsView[] = [
  //   {
  //     type: 'ProgressCard',
  //     data: {
  //       title: 'Database usage',
  //       data: [
  //         {
  //           title: 'Database size',
  //           currentValue: 74.14,
  //           total: 512,
  //           unit: 'MB'
  //         },
  //         {
  //           title: 'Database agress',
  //           currentValue: 0,
  //           total: 2,
  //           unit: 'GB'
  //         }
  //       ]
  //     }
  //   }
  // ];

  // apiMetrics: JSONMetricsView[] = [
  //   {
  //     type: 'LineChartCard',
  //     data: {
  //       title: 'Total Requests',
  //       tips: '2',
  //       data: [
  //         {
  //           name: 'Mar 14, 2023, 07:00am',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 1
  //         },
  //         {
  //           name: '',
  //           value: 1
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: 'Mar 14, 2023, 07:00am',
  //           value: 0
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     type: 'BarChartCard',
  //     data: {
  //       title: 'Response Errors',
  //       data: []
  //     }
  //   },
  //   {
  //     type: 'BarChartCard',
  //     data: {
  //       title: 'Response Speed',
  //       tips: '1059ms',
  //       data: [
  //         {
  //           name: 'Mar 14, 2023, 07:00am',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 100
  //         },
  //         {
  //           name: '',
  //           value: 1059
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: '',
  //           value: 0
  //         },
  //         {
  //           name: 'Mar 14, 2023, 07:00am',
  //           value: 0
  //         }
  //       ]
  //     }
  //   }
  // ];

  showContent: 'DATABASE' | 'API' = 'API';

  get metricsData() {
    if (this.showContent === 'DATABASE') {
      return [this.dataBaseMetrics];
    }

    if (this.showContent === 'API') {
      // return this.apiMetrics;
      console.log([this.publisherMetrics]);
      return [this.publisherMetrics, this.eventMetrics, this.blockchainMetrics];
    }

    return [];
  }

  constructor() {
    makeObservable(this, {
      showContent: observable
    });
  }
}

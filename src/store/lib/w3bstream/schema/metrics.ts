import { JSONMetricsView } from '@/components/JSONMetricsView';
import { makeObservable, observable } from 'mobx';

export default class MetricsModule {
  databaseMetrics: JSONMetricsView[] = [
    {
      type: 'ProgressCard',
      data: {
        title: 'Database usage',
        data: [
          {
            title: 'Database size',
            currentValue: 74.14,
            total: 512,
            unit: 'MB'
          },
          {
            title: 'Database agress',
            currentValue: 0,
            total: 2,
            unit: 'GB'
          }
        ]
      }
    }
  ];

  apiMetrics: JSONMetricsView[] = [
    {
      type: 'BarChartCard',
      data: {
        title: 'Total Requests',
        tips: '2',
        data: [
          {
            name: 'Mar 14, 2023, 07:00am',
            value: 0,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: '',
            value: 1,
          },
          {
            name: '',
            value: 1,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: 'Mar 14, 2023, 07:00am',
            value: 0,
          }
        ],
      }
    },
    {
      type: 'BarChartCard',
      data: {
        title: 'Response Errors',
        data: []
      }
    },
    {
      type: 'BarChartCard',
      data: {
        title: 'Response Speed',
        tips: '1059ms',
        data: [
          {
            name: 'Mar 14, 2023, 07:00am',
            value: 0,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: '',
            value: 100,
          },
          {
            name: '',
            value: 1059,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: '',
            value: 0,
          },
          {
            name: 'Mar 14, 2023, 07:00am',
            value: 0,
          }
        ],
      }
    },
  ];

  showContent: 'DATABASE' | 'API' = 'DATABASE';

  get metricsData() {
    if (this.showContent === 'DATABASE') {
      return this.databaseMetrics;
    }

    if (this.showContent === 'API') {
      return this.apiMetrics;
    }

    return [];
  }

  constructor() {
    makeObservable(this, {
      showContent: observable
    });
  }
}

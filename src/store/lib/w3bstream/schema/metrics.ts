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
        tips: '10',
        data: [
          {
            name: 'Mar 14, 2023, 07:00am',
            amount: 0,
          },
          {
            name: '',
            amount: 0,
          },
          {
            name: '',
            amount: 0,
          },
          {
            name: '',
            amount: 10,
          },
          {
            name: '',
            amount: 0,
          },
          {
            name: '',
            amount: 0,
          },
          {
            name: 'Mar 14, 2023, 07:00am',
            amount: 0,
          }
        ],
      }
    }
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

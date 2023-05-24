import { JSONMetricsView } from '@/components/JSONMetricsView';
import { PromiseState } from '@/store/standard/PromiseState';
import axios from 'axios';
import { makeObservable, observable } from 'mobx';
import dayjs from 'dayjs';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import { MappingState } from '@/store/standard/MappingState';

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
      onChange: (value: "day" | "week" | "month") => {
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        this.timeconfig.setCurrentId(value)

        const { stepTime, step } = this.timeconfig.current;

        const startTime = new Date(now.getTime() - stepTime);
        const endTime = now

        this.activeDevices.call(startTime, endTime, step);
        this.dataMessages.call(startTime, endTime, step);
        this.blockchainTransaction.call(startTime, endTime, step);
      }
    }
  };


  timeconfig = new MappingState({
    currentId: "day",
    map: {
      day: {
        tickValues: 'every 1 hours',
        stepTime: 3600*1000,
        step: '1h',
        axisBottomFormat: '%H:%M'

      },
      week: {
        tickValues: 'every 1 hours',
        stepTime: 7 * 24 * 60 * 60 * 1000,
        step: '24h',
        axisBottomFormat: '%Y-%m-%d'
      },
      month: {
        tickValues: 'every day',
        stepTime: 30 * 24 * 60 * 60 * 1000,
        step: '24h',
        axisBottomFormat: '%Y-%m-%d'
      }
    }
  })

  activeDevices = new PromiseState<any, Metrics[]>({
    defaultValue: [],
    function: async (startTime: Date, endTime: Date, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `count(count_over_time(inbound_events_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"}[1d])) by (project)`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
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
    function: async (startTime: Date, endTime: Date, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (inbound_events_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"})`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
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
    function: async (startTime: Date, endTime: Date, step = 3600) => {
      try {
        const { data } = await axios.request({
          method: 'GET',
          url: `/api/metrics/query_range`,
          params: {
            query: `sum by (project) (w3b_blockchain_tx_metrics{project="${globalThis.store.w3s.project.curProject.f_name}"})`,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
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
      .map((i) => ({ x: dayjs(i[0] * 1000).format('YYYY-MM-DD HH:mm'), y: Number(i[1]) }));
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Active Devices',
        description: 'Number of unique devices that sent at least one message to this project',
        data: [
          {
            id: 'Active Devices',
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
          format: this.timeconfig.current.axisBottomFormat,
          tickValues: this.timeconfig.current.tickValues,
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
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Data Messages',
        description: 'Total number of messages received from all devices',
        data: [
          {
            id: 'Data Messages',
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
          format: this.timeconfig.current.axisBottomFormat,
          tickValues: this.timeconfig.current.tickValues,
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
    // if (list.length === 1) {
    //   const d = dayjs(list[0][0]);
    //   list = [{ x: d.subtract(8, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, { x: d.subtract(4, 'hour').minute(0).format('YYYY-MM-DD HH:mm'), y: 0 }, ...list];
    // }
    return {
      type: 'LineChartCard',
      data: {
        title: 'Blockchain Transaction',
        description: `Total number of blockchain transactions sent by the project's applet.`,
        data: [
          {
            id: 'Blockchain Transaction',
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
          format: this.timeconfig.current.axisBottomFormat,
          tickValues: this.timeconfig.current.tickValues,
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


  use() {
    useEffect(() => {
      const now = new Date();
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      this.activeDevices.call(yesterday, now);
      this.dataMessages.call(yesterday, now);
      this.blockchainTransaction.call(yesterday, now);
      return () => {}
    },[])
  }
}

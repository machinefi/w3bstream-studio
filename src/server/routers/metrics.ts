import { t } from '../trpc';
import axios from 'axios';
import { z } from 'zod';

export const metricsRouter = t.router({
  metrics: t.procedure
    .input(
      z.object({
        path: z.string(),
        params: z.any(),
        method: z.string()
      })
    )
    .query(async ({ ctx, input: { path, params, method } }) => {
      const url = `${process.env.NEXT_PUBLIC_METRICS_URL}/api/v1/${path}`;
      console.log(url,params);
      try {
        const axiosResponse = await axios.request({
          url,
          params,
          //@ts-ignore
          method
        });
        return axiosResponse.data;
      } catch (error) {
        throw new Error(error.response?.data ?? 'Unknow Error');
      }
    })
});

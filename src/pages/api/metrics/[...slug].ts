import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { slug, ...params } = query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const url = `${process.env.NEXT_PUBLIC_METRICS_URL}/api/v1/${path}`;
  try {
    const axiosResponse = await axios.request({
      url,
      params,
      // @ts-ignore
      method
    });
    res.status(axiosResponse.status).json(axiosResponse.data);
  } catch (error) {
    res.status(error.response?.status ?? 500).send(error.response?.data ?? 'Unknow Error');
  }
};

export default handler;

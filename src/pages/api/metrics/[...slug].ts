import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { slug, ...params } = query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const url = `${process.env.NEXT_PUBLIC_METRICS_URL}/api/v1/${path}`;
  console.log(url, method, params, body, headers)
  try {
    const axiosResponse = await axios.request({
      url,
      headers,
      params,
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      data: body
    });
    res.status(axiosResponse.status).json(axiosResponse.data);
  } catch (error) {
    console.log(error.response.data)
    res.status(error.response.status).send(error.response.data);
  }
};

export default handler;

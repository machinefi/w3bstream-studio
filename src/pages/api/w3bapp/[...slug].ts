import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { slug, ...params } = query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const apiURL = path.includes("event") ?  process.env.NEXT_PUBLIC_EVENT_URL:process.env.NEXT_PUBLIC_API_URL
  const url = `${apiURL}/srv-applet-mgr/v0/${path}`;
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
    res.status(error.response?.status).send(error.response?.data);
  }
};

export default handler;

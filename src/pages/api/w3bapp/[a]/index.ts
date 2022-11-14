import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { a, ...params } = query;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/${a}`;

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
    res.status(error.response.status).send(error.response.data);
  }
};

export default handler;

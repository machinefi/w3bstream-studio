import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { a, b, c, ...params } = query;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/${a}/${b}/${c}`;

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

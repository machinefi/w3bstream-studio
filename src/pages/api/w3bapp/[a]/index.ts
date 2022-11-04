import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { a, ...params } = query;

  const url = `${publicRuntimeConfig.SERVER_BASE_PATH}/${a}`;

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

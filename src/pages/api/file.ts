import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    method,
    query: { api }
  } = req;
  const url = `${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/${api}`;
  if (method === 'POST') {
    try {
      const axiosResponse = await axios.post(url, req, {
        headers: req.headers
      });
      res.status(axiosResponse.status).json(axiosResponse.data);
    } catch (error) {
      res.status(error.response.status).send(error.response.data);
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;

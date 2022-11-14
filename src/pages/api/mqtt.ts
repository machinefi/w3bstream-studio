const { connectAsync } = require('async-mqtt');
import type { NextApiRequest, NextApiResponse } from 'next';

const client = await connectAsync(process.env.NEXT_PUBLIC_MQTT_URL);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { topic, message } = req.body;
    if (!topic || !message) {
      res.status(400).send('invalid request');
      return;
    }
    try {
      const result = await client.publish(topic, JSON.stringify(message));
      await client.end();
      res.status(200).json({ message: 'success' });
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;

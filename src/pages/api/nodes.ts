import { NextApiRequest, NextApiResponse } from 'next';
import { nodeManager } from '../../server/nodes/index';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).send(nodeManager.nodesJSON);
  } catch (err) {
    res.status(200).send(err);
  }
};
export default handler;

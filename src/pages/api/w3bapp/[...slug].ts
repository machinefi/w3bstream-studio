import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, body, headers } = req;
  const { slug, ...params } = query;
  const path = Array.isArray(slug) ? slug.join('/') : slug;
  const baseURL = path.includes('event') ? process.env.NEXT_PUBLIC_EVENT_URL : process.env.NEXT_PUBLIC_API_URL;
  return NextResponse.rewrite(new URL(`/srv-applet-mgr/v0/${path}`, baseURL));
};

export default handler;

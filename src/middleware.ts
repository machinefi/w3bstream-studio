import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/w3bapp', '');
  const newPath = '/srv-applet-mgr/v0' + path;
  console.log(path)
  const searchParams = new URLSearchParams(req.nextUrl.search);
  if (path.startsWith('/event')) {
    const newURL = new URL(newPath, process.env.NEXT_PUBLIC_EVENT_URL)
    newURL.search = searchParams.toString()
    return NextResponse.rewrite(newURL);
  }
  const newURL = new URL(newPath, process.env.NEXT_PUBLIC_API_URL)
  newURL.search = searchParams.toString()
  return NextResponse.rewrite(newURL);
}

export const config = {
  matcher: ['/api/w3bapp/:path*']
};

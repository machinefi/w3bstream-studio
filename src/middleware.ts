import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/w3bapp', '');
  const newPath = '/srv-applet-mgr/v0' + path;

  if (path.startsWith('/event')) {
    return NextResponse.rewrite(new URL(newPath, process.env.NEXT_PUBLIC_EVENT_URL));
  }
  return NextResponse.rewrite(new URL(newPath, process.env.NEXT_PUBLIC_API_URL));
}

export const config = {
  matcher: ['/api/w3bapp/:path*']
};

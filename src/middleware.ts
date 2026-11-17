import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LANG_COOKIE, type Locale } from './i18n/config';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

const YEAR = 60 * 60 * 24 * 365;

/**
 * Picks the language for a first-time visitor: Thai for visitors in Thailand, English for everyone else.
 * Vercel sets x-vercel-ip-country on every request; locally it's missing, so English is used.
 */
function detectLocale(req: NextRequest): Locale {
  return req.headers.get('x-vercel-ip-country')?.toUpperCase() === 'TH' ? 'th' : 'en';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin: password session required (except the login page). Thai only, not localized.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname.startsWith('/admin/login')) return NextResponse.next();
    if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  const first = pathname.split('/')[1];

  // Explicit /en/... or /th/... (search engines, hreflang links): serve it and remember the choice.
  if (isLocale(first)) {
    const res = NextResponse.next();
    if (cookie !== first) res.cookies.set(LANG_COOKIE, first, { path: '/', maxAge: YEAR, sameSite: 'lax' });
    return res;
  }

  // Everything else keeps its clean URL and is served from the prebuilt page for the visitor's language.
  const lang = isLocale(cookie) ? cookie : detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`;
  const res = NextResponse.rewrite(url);
  if (cookie !== lang) res.cookies.set(LANG_COOKIE, lang, { path: '/', maxAge: YEAR, sameSite: 'lax' });
  return res;
}

export const config = {
  // Skip Next internals, API routes, and files (anything with a dot: images, icon.png, robots.txt, sitemap.xml).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};

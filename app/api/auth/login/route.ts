import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, passwordMatches, SESSION_COOKIE, sessionMaxAge } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!process.env.APP_ACCESS_PASSWORD || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: 'A autenticação não está configurada no servidor.' }, { status: 503 });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Origem não autorizada.' }, { status: 403 });
  }
  let body: { password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  if (typeof body.password !== 'string' || body.password.length > 256 || !passwordMatches(body.password)) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: sessionMaxAge,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

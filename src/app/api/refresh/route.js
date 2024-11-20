import { NextResponse } from 'next/server';

export async function GET(request) {
  const refreshToken = request.cookies.get('spotify-refresh-token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token missing' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return NextResponse.json({ error: data.error }, { status: 400 });
  }

  const { access_token, expires_in } = data;

  const res = NextResponse.json({ access_token });
  res.cookies.set('spotify-token', access_token, {
    httpOnly: true,
    maxAge: expires_in,
    path: '/',
  });

  return res;
}

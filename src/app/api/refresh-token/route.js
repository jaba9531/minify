import { NextResponse } from 'next/server';

export async function POST(request) {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 400 });
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
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

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token refresh error:', tokenData.error);
      return NextResponse.json({ error: tokenData.error }, { status: 400 });
    }

    const { access_token, expires_in } = tokenData;

    return NextResponse.json({
      access_token,
      expires_in,
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

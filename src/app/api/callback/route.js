import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Save tokens as cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
    response.cookies.set('spotify-token', access_token, {
      httpOnly: false,
      maxAge: expires_in,
      path: '/',
    });
    response.cookies.set('spotify-refresh-token', refresh_token, {
      httpOnly: false,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Callback Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

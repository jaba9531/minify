'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already authenticated
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('spotify-token='))
      ?.split('=')[1];

    if (token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login to MiniFy</h1>
      <p>Click below to authenticate and start using the app.</p>
      <a
        href="/api/login"
        rel="noopener noreferrer"
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#1DB954',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          textDecoration: 'none',
        }}
      >
        Login with Spotify
      </a>
    </div>
  );
}

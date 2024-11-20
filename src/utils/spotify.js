export const fetchSpotifyData = async (token, endpoint) => {
  const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data from Spotify API');
  }

  return response.json();
};

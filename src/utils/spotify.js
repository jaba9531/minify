const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Base function to fetch data from the Spotify API.
 * @param {string} token - The Spotify access token.
 * @param {string} endpoint - The Spotify API endpoint (e.g., 'me', 'playlists').
 * @param {object} [options] - Additional options for the fetch request (e.g., method, body).
 * @returns {Promise<any>} - The parsed JSON response.
 */
export const fetchSpotifyData = async (token, endpoint, options = {}) => {
  const response = await fetch(`${SPOTIFY_BASE_URL}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to fetch data from Spotify API: ${errorData.error?.message || response.statusText}`
    );
  }

  return response.json();
};

/**
 * Fetch the current user's profile.
 * @param {string} token - The Spotify access token.
 * @returns {Promise<any>} - The user's profile data.
 */
export const fetchUserProfile = (token) => fetchSpotifyData(token, 'me');

/**
 * Search for tracks, artists, albums, or playlists.
 * @param {string} token - The Spotify access token.
 * @param {string} query - The search query.
 * @param {string} [type='track'] - The type of item to search for (e.g., 'track', 'artist').
 * @param {number} [limit=10] - The maximum number of results to return (default: 10).
 * @returns {Promise<any>} - The search results.
 */
export const searchSpotify = (token, query, type = 'track', limit = 10) =>
  fetchSpotifyData(token, `search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);

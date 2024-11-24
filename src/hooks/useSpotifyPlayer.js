import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function useSpotifyPlayer() {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth.token) return;

    const script = document.getElementById('spotify-player');

    if (!script) {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'spotify-player';
      scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: 'MiniFy Player',
        getOAuthToken: async (cb) => {
          cb(auth.token);
        },
        volume: 0.5,
      });

      // Error handling
      playerInstance.addListener('initialization_error', ({ message }) => { console.error(message); });
      playerInstance.addListener('authentication_error', ({ message }) => { console.error(message); });
      playerInstance.addListener('account_error', ({ message }) => { console.error(message); });
      playerInstance.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      playerInstance.addListener('player_state_changed', state => {
        console.log('Player State Changed:', state);
        if (!state) return;
        setPlayerState(state);
      });

      // Inside player ready listener
      playerInstance.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      // Not Ready
      playerInstance.addListener('not_ready', ({ device_id }) => {
        console.warn('Player has become not ready:', device_id);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect player...');
          player.connect().then(success => {
            if (success) {
              console.log('Reconnected to player successfully');
            } else {
              console.error('Failed to reconnect to player');
            }
          });
        }, 5000); // Attempt reconnection after 5 seconds
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [auth.token]);

  return { player, deviceId, playerState };
}

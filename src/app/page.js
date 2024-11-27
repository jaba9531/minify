'use client';

import Image from "next/image";
import styles from "./page.module.css";
import userAvatar from "../assets/images/mock-user-avatar.jpg";
import { RxCross1 } from "react-icons/rx";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import useDebounce from '@/hooks/useDebounce';
import { fetchSpotifyData, searchSpotify  } from '../utils/spotify';
import useSpotifyPlayer from '@/hooks/useSpotifyPlayer';

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchInput = useDebounce(searchText, 400);
  const [songs, setSongs] = useState([]);
  const [_loading, setLoading] = useState(false);
  const [_error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const { auth, logout } = useAuth();

  const { player, deviceId, playerState } = useSpotifyPlayer();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progressMs, setProgressMs] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const profileImage = profile?.images?.[0]?.url || userAvatar;

  const handleSearch = async () => {
    if (searchText.trim() !== '') {
      setLoading(true);
      setError(null);
      try {
        const data = await searchSpotify(auth.token, searchText, 'track');
        setSongs(data.tracks.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const startPlayback = async () => {
    if (!deviceId || !auth.token) {
      console.error('Device ID or Access Token is missing');
      return;
    }
  
    try {
      // Ensure the player is active
      await ensurePlayerIsActive();
  
      // Start playback without specifying a context to play from the queue
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to start playback:', errorData);
      } else {
        console.log('Playback started');
      }
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };
  

  useEffect(() => {
    if (debouncedSearchInput) {
      console.log(`Searching for: ${debouncedSearchInput}`);
      handleSearch();
    }
  }, [debouncedSearchInput]);

  // Update UI when playerState changes
  useEffect(() => {
    if (playerState) {
      const {
        paused,
        position,
        track_window: { current_track },
      } = playerState;

      setIsPaused(paused);
      setProgressMs(position);
      setCurrentTrack(current_track);
    }
  }, [playerState]);

  useEffect(() => {
    const fetchData = async () => {
      if (auth.token) {
        try {
          const data = await fetchSpotifyData(auth.token, 'me');
          setProfile(data);
        } catch (error) {
          console.error('Error fetching Spotify profile:', error);
        }
      }
    };

    fetchData();
  }, [auth.token]);

  const transferPlayback = async (shouldPlay = false) => {
    if (!deviceId || !auth.token) return;
    if (deviceId) {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          body: JSON.stringify({
            device_ids: [deviceId],
            play: shouldPlay, // Set to true if you want to start playing immediately
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to transfer playback:', await response.json());
        } else {
          console.log('Playback transferred to web player');
        }
      } catch (error) {
        console.error('Error transferring playback:', error);
      }
    }
  };

  // Initial transferPlayback
  useEffect(() => {
    if (deviceId) {
      transferPlayback(false);
    }
  }, [deviceId]);

  useEffect(() => {
    let interval = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setProgressMs(prev => prev + 1000);
      }, 1000);
    } else if (isPaused && progressMs !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPaused]);
  
  // Update progressMs when playerState changes
  useEffect(() => {
    if (playerState) {
      setProgressMs(playerState.position);
    }
  }, [playerState]);

  const handlePlayPause = async () => {
    if (!player || !auth.token) return;
  
    try {
      // Get the current playback state
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
  
      if (response.status === 204) {
        // No active playback, start playback
        await startPlayback();
      } else if (response.status === 200) {
        const data = await response.json();
        if (data.is_playing) {
          // If playing, pause
          await player.pause();
        } else {
          // If paused, resume
          await player.resume();
        }
      } else {
        console.error('Failed to get playback state:', await response.json());
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
    }
  };
  
  
  const handleNextTrack = () => {
    if (player) {
      player.nextTrack();
    }
  };
  
  const handlePreviousTrack = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const handleSeek = value => {
    if (player) {
      player.seek(value);
      setProgressMs(value);
    }
  };

  const ensurePlayerIsActive = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${auth.token }`,
        },
      });

      if (response.status === 204 || response.status === 200) {
        const data = response.status === 200 ? await response.json() : null;
        if (!data || data.device.id !== deviceId) {
          await transferPlayback();
        }
      } else {
        // Transfer playback to our device
        await transferPlayback();
      }
    } catch (error) {
      console.error('Error ensuring player is active:', error);
    }
  };

  const handlePlayTrack = async (trackUri) => {
    if (!deviceId || !auth.token) {
      console.error('Device ID or Access Token is missing');
      return;
    }

    try {
      await ensurePlayerIsActive();

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            uris: [trackUri],
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to play track:', errorData);
      } else {
        console.log('Playback started for track:', trackUri);
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleAddToQueue = async trackUri => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${trackUri}&device_id=${deviceId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error('Failed to add track to queue:', await response.json());
      } else {
        console.log('Track added to queue');
      }
    } catch (error) {
      console.error('Error adding track to queue:', error);
    }
  };

  // Utility function to format milliseconds to mm:ss
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!auth.isAuthenticated || !profile) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerContainer}`}>
          <h1 className={styles.title}>MiniFy</h1>
          <Image
            src={profileImage}
            alt="user avatar"
            width={50}
            height={50}
            className={styles.userAvatar}
          />
        </div>
      </header>
      <main className={styles.mainLayout}>
        <div className={styles.container}>
          {currentTrack && (
            <>
              <h2 className={styles.playerTitle}>Now Playing:</h2>
              <div className={styles.albumBanner} style={{ '--album-image': `url(${currentTrack.album.images[0].url})` }}>
                <Image
                  src={currentTrack.album.images[0].url}
                  alt="album art"
                  className={styles.albumArtImage}
                  width={200}
                  height={200}
                />
              </div>
              <h2 className={styles.playerTrackName}>{currentTrack?.name || 'Track Name'}</h2>
              <p className={styles.playerArtistName}>{currentTrack?.artists?.map(artist => artist.name).join(', ') || 'Artist Name'}</p>
            </>
          )}
          <div className={styles.searchInput}>
            <HiMagnifyingGlass
              style={{ color: "#ccc", margin: "0px 0px 0px 10px" }}
              size={28}
            />
            <input
              type="text"
              value={searchText}
              placeholder="Search"
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.musicInput}
            />
            {
              searchText.trim() !== '' && (
                <RxCross1
                  style={{ color: "#ccc", margin: "0 12px 0 0 ", padding: "6px", cursor: "pointer" }}
                  size={22}
                  onClick={() => setSearchText('')}
                />
              )
            }
          </div>
          {
            songs.length > 0 && (
              <ul className={styles.trackList}>
                  {
                    songs.map((song) => (
                      <li key={song.id} className={styles.trackListTrack}>
                        <div className={styles.trackListFlexContainer}>
                        <p className={`${styles.trackListTrackName} ${styles.truncate}`}>{song.name}</p>
                        <p className={`${styles.trackListArtistName} ${styles.truncate}`}>{song.artists.map((artist) => artist.name).join(', ')}</p>
                        </div>
                        <div className={styles.trackListFlexContainer}>
                        <button
                          className={`${styles.trackListButton} ${styles.playButton}`}
                          onClick={() => handlePlayTrack(song.uri)}
                        >
                          Play
                        </button>
                          <button
                            className={`${styles.trackListButton} ${styles.greenBackground}`}
                            onClick={() => {
                              if (currentTrack) {
                                handleAddToQueue(song.uri);
                              } else {
                                handlePlayTrack(song.uri);
                              }
                            }}
                          >
                          Add to Queue
                        </button>
                        </div>
                      </li>
                    ))
                  }
              </ul>
            )
          }
          <button className={styles.logoutButton} onClick={logout}>Logout</button>
        </div>
      </main>
      <footer>
        <div className={styles.playbackControls}>
          <div className={`${styles.container} ${styles.playbackContainer}`}>
            <div className={styles.playbackControlElements}>
            <button className={styles.prevButton} onClick={handlePreviousTrack}>
              ⏮
            </button>
            <button className={styles.playPauseButton} onClick={handlePlayPause}>
              {isPaused ? '▶️' : '⏸'}
            </button>
            <button className={styles.nextButton} onClick={handleNextTrack}>
              ⏭
            </button>
            </div>
            <div className={styles.progressInputControl}>
            <input
              type="range"
              className={styles.progressBar}
              min="0"
              max={currentTrack?.duration_ms || 100}
              value={progressMs}
              onChange={e => handleSeek(Number(e.target.value))}
            />
            </div>
            <p className={styles.progressTime}>{formatTime(progressMs)} / {formatTime(currentTrack?.duration_ms || 0)}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

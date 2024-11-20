'use client';

import Image from "next/image";
import styles from "./page.module.css";
import userAvatar from "../assets/images/mock-user-avatar.jpg";
import albumArt from "../assets/images/man-on-the-moon-album-art.jpeg";
import { RxCross1 } from "react-icons/rx";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import useDebounce from '@/hooks/useDebounce';
import { fetchSpotifyData, searchSpotify  } from '../utils/spotify';

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchInput = useDebounce(searchText, 400);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState(null);
  const { auth, logout } = useAuth();

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

  useEffect(() => {
    if (debouncedSearchInput) {
      console.log(`Searching for: ${debouncedSearchInput}`);
      handleSearch();
    }
  }, [debouncedSearchInput]);


  useEffect(() => {
    const fetchData = async () => {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('spotify-token='))
        ?.split('=')[1];

      if (token) {
        try {
          const data = await fetchSpotifyData(token, 'me');
          setProfile(data);
        } catch (error) {
          console.error('Error fetching Spotify profile:', error);
        }
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    setProgress(event.target.value);
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
          <h2 className={styles.playerTitle}>Now Playing:</h2>
          <div className={styles.albumBanner}>
            <Image
              src={albumArt}
              alt="album art"
              className={styles.albumArtImage}
              width={200}
              height={200}
            />
          </div>
          <h2 className={styles.playerTrackName}>Man on the Moon</h2>
          <p className={styles.playerArtistName}>Kid Cudi</p>
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
                        <p className={styles.trackListTrackName}>{song.name}</p>
                        <p className={styles.trackListArtistName}>{song.artists.map((artist) => artist.name).join(', ')}</p>
                        <button className={`${styles.trackListButton} ${styles.greenBackground}`}>Add to Queue</button>
                      </li>
                    ))
                  }
              </ul>
            )
          }
        </div>
        <button onClick={logout}>Logout</button>
      </main>
      <footer>
        <div className={styles.playbackControls}>
          <div className={`${styles.container} ${styles.playbackContainer}`}>
            <div className={styles.playbackControlElements}>
              <button className={styles.prevButton}>⏮</button>
              <button className={styles.playPauseButton}>▶️</button>
              <button className={styles.nextButton}>⏭</button>
            </div>
            <div className={styles.progressInputControl}>
              <input
                type="range"
                className={styles.progressBar}
                min="0"
                max="100"
                value={progress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

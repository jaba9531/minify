'use client';

import Image from "next/image";
import styles from "./page.module.css";
import userAvatar from "../assets/images/mock-user-avatar.jpg";
import albumArt from "../assets/images/man-on-the-moon-album-art.jpeg";
import { FaSearch } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { fetchSpotifyData } from '../utils/spotify';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState(null);
  const { auth, logout } = useAuth();

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

  if (!auth.isAuthenticated || !profile) {
    return <p>Loading...</p>;
  }

  const handleChange = (event) => {
    setProgress(event.target.value);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerContainer}`}>
          <h1 className={styles.title}>MiniFy</h1>
          <Image
            src={userAvatar}
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
            <FaSearch style={{ color: "#ccc", marginRight: "10px" }} size={20} />
            <input type="text" placeholder="Search" className={styles.musicInput} />
            <ImCross style={{ color: "#ccc", marginLeft: "10px" }} size={20} />
          </div>
          <h2 className={styles.searchResultsTitle}>Search Results:</h2>
          <div className={styles.trackList}>
            <div className={styles.trackListTrack}>
              <p className={styles.trackListTrackName}>Track Title 1</p>
              <p className={styles.trackListArtistName}>Artist Name</p>
              <button className={`${styles.trackListButton} ${styles.greenBackground}`}>Add to Queue</button>
            </div>
            <div className={styles.trackListTrack}>
              <p className={styles.trackListTrackName}>Track Title 2</p>
              <p className={styles.trackListArtistName}>Artist Name</p>
              <button className={`${styles.trackListButton} ${styles.greenBackground}`}>Add to Queue</button>
            </div>
          </div>
          <h2 className={styles.queueTitle}>Queue:</h2>
          <div className={styles.trackList}>
            <div className={styles.trackListTrack}>
              <p className={styles.trackListTrackName}>Track Title 1</p>
              <p className={styles.trackListArtistName}>Artist Name</p>
              <button className={`${styles.trackListButton} ${styles.redBackground}`}>Remove From Queue</button>
            </div>
            <div className={styles.trackListTrack}>
              <p className={styles.trackListTrackName}>Track Title 2</p>
              <p className={styles.trackListArtistName}>Artist Name</p>
              <button className={`${styles.trackListButton} ${styles.redBackground}`}>Remove From Queue</button>
            </div>
          </div>
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

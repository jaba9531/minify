'use client';

import Image from "next/image";
import styles from "./page.module.css";
import userAvatar from "../assets/images/mock-user-avatar.jpg";
import albumArt from "../assets/images/man-on-the-moon-album-art.jpeg";
import { FaSearch } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useState } from "react";

export default function Home() {
  const [progress, setProgress] = useState(0);

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
            width={40}
            height={40}
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
          <h2 className={styles.playerTrackName}>Innerbloom</h2>
          <p className={styles.playerArtistName}>Rufus Du Sol</p>
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

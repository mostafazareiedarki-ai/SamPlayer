import React from 'react';
import { usePlayer } from '../store/playerStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { formatTime } from '../utils/audioUtils';

const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const NextIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 18l8.5-6L6 6v12zm2.5-8.5L11.47 12 8.5 14.5V9.5zM16 6h2v12h-2z"/></svg>;

export default function MiniPlayer() {
  const { state, dispatch } = usePlayer();
  const { queue, currentIndex, isPlaying, currentTime, duration } = state;
  const { play, pause, playNext, currentSong } = useAudioEngine();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mini-player" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'now-playing' })}>
      <div className="progress-thin">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="cover-art" style={{ width: 48, height: 48 }}>
        {currentSong.cover
          ? <img src={currentSong.cover} alt="" />
          : <div className="placeholder">♪</div>}
      </div>

      <div className="mini-info">
        <div className="mini-title">{currentSong.title}</div>
        <div className="mini-artist">{currentSong.artist}</div>
      </div>

      <div className="controls" onClick={e => e.stopPropagation()}>
        <button className="btn-icon" onClick={() => isPlaying ? pause() : play()}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="btn-icon" onClick={playNext}>
          <NextIcon />
        </button>
      </div>
    </div>
  );
}

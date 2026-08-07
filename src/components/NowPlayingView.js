import React, { useRef, useState } from 'react';
import { usePlayer } from '../store/playerStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { formatTime, parseLyrics } from '../utils/audioUtils';

const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>;
const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 18l8.5-6L6 6v12zm2.5-8.5L11.47 12 8.5 14.5V9.5zM16 6h2v12h-2z"/></svg>;
const ShuffleIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
const RepeatIcon = ({ mode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    {mode === 'one' && <text x="9" y="14" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">1</text>}
  </svg>
);
const LyricIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const VolumeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>;

export default function NowPlayingView() {
  const { state, dispatch } = usePlayer();
  const { isPlaying, currentTime, duration, volume, shuffle, repeat, lyricsHighlight } = state;
  const { currentSong, play, pause, seek, playNext, playPrev } = useAudioEngine();
  const [showLyrics, setShowLyrics] = useState(false);
  const progressRef = useRef();

  if (!currentSong) return (
    <div className="empty-state"><div className="icon">🎵</div><p>No song selected</p></div>
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const lyrics = parseLyrics(currentSong.lyrics || '');
  const timedLyrics = lyrics.filter(l => l.time !== null);
  const plainLyrics = lyrics.filter(l => l.time === null);
  const hasLyrics = lyrics.length > 0;

  return (
    <div className="now-playing">
      {/* Gradient background */}
      <div className="gradient-bg" style={{
        background: `radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 70%)`
      }} />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 8px' }}>
        <button className="btn-icon" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'library' })}>
          <BackIcon />
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Now Playing</span>
        <button className={`btn-icon ${showLyrics && hasLyrics ? 'active' : ''}`}
          onClick={() => setShowLyrics(v => !v)} disabled={!hasLyrics} style={{ opacity: hasLyrics ? 1 : 0.3 }}>
          <LyricIcon />
        </button>
      </div>

      {/* Cover or Lyrics */}
      {showLyrics && hasLyrics ? (
        <LyricsPanel lyrics={timedLyrics.length ? timedLyrics : plainLyrics} activeIndex={lyricsHighlight} timed={timedLyrics.length > 0} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
          <div className={`now-playing cover-wrap ${isPlaying ? 'playing' : ''}`}>
            {currentSong.cover
              ? <img src={currentSong.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', background: 'var(--surface)' }}>🎵</div>}
          </div>
        </div>
      )}

      {/* Track info */}
      <div className="track-info">
        <div className="track-title">{currentSong.title}</div>
        <div className="track-artist">{currentSong.artist}</div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-track" ref={progressRef} onClick={handleProgressClick}>
          <div className="fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-times">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <button className={`btn-icon ${shuffle ? 'active' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}>
          <ShuffleIcon />
        </button>
        <button className="btn-icon" style={{ width: 44, height: 44 }} onClick={playPrev}><PrevIcon /></button>
        <button className="btn-play-main" onClick={() => isPlaying ? pause() : play()}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="btn-icon" style={{ width: 44, height: 44 }} onClick={playNext}><NextIcon /></button>
        <button className={`btn-icon ${repeat !== 'none' ? 'active' : ''}`} onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}>
          <RepeatIcon mode={repeat} />
        </button>
      </div>

      {/* Volume */}
      <div className="volume-row" style={{ marginTop: 8 }}>
        <VolumeIcon />
        <input type="range" min="0" max="1" step="0.01" value={volume}
          onChange={e => dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) })}
          style={{ background: `linear-gradient(to right, var(--accent) ${volume * 100}%, var(--surface2) ${volume * 100}%)` }}
        />
      </div>
    </div>
  );
}

function LyricsPanel({ lyrics, activeIndex, timed }) {
  const activeRef = useRef();

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  if (!lyrics.length) return (
    <div className="lyrics-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
      No lyrics
    </div>
  );

  return (
    <div className="lyrics-container" style={{ height: '40vh', overflowY: 'auto', padding: '0 8px' }}>
      {lyrics.map((line, i) => (
        <div
          key={i}
          ref={i === activeIndex ? activeRef : null}
          className={`lyric-line ${timed && i === activeIndex ? 'active' : timed && i < activeIndex ? 'prev' : ''}`}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

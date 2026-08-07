import React from 'react';
import { usePlayer } from '../store/playerStore';
import { formatTime } from '../utils/audioUtils';

const BackIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6"/></svg>;
const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>;

export default function AlbumDetailView() {
  const { state, dispatch } = usePlayer();
  const { selectedAlbum, queue, currentIndex } = state;

  if (!selectedAlbum) return null;

  const currentId = queue[currentIndex]?.id;

  const playSong = (song) => {
    dispatch({ type: 'SET_QUEUE', payload: selectedAlbum.songs, index: selectedAlbum.songs.indexOf(song) });
    dispatch({ type: 'SET_PLAYING', payload: true });
    dispatch({ type: 'SET_VIEW', payload: 'now-playing' });
  };

  const playAll = () => {
    dispatch({ type: 'SET_QUEUE', payload: selectedAlbum.songs, index: 0 });
    dispatch({ type: 'SET_PLAYING', payload: true });
    dispatch({ type: 'SET_VIEW', payload: 'now-playing' });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ position: 'relative' }}>
        <div style={{ aspectRatio: '16/9', background: 'var(--bg3)', overflow: 'hidden', position: 'relative' }}>
          {selectedAlbum.cover
            ? <img src={selectedAlbum.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.6)', transform: 'scale(1.05)' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>💿</div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg) 100%)' }} />
        </div>

        <button className="btn-icon" style={{ position: 'absolute', top: 12, left: 12, background: '#00000060', backdropFilter: 'blur(8px)' }}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'albums' })}>
          <BackIcon />
        </button>

        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{selectedAlbum.name}</h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{selectedAlbum.artist}</p>
          </div>
          <button className="btn btn-primary" style={{ borderRadius: '50%', width: 48, height: 48, padding: 0 }} onClick={playAll}>
            <PlayIcon />
          </button>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', margin: '0 16px 8px' }} />

      {selectedAlbum.songs.map((song, i) => (
        <div key={song.id} className={`song-row ${song.id === currentId ? 'active' : ''}`}
          onClick={() => playSong(song)}>
          <div style={{ width: 24, textAlign: 'center', color: song.id === currentId ? 'var(--accent2)' : 'var(--text3)', fontSize: '0.85rem', fontWeight: 500 }}>
            {song.id === currentId ? '♪' : (song.track || i + 1)}
          </div>
          <div className="song-info">
            <div className="song-title">{song.title}</div>
            <div className="song-meta">{song.artist}</div>
          </div>
          <div className="song-duration">{formatTime(song.duration)}</div>
        </div>
      ))}
    </div>
  );
}

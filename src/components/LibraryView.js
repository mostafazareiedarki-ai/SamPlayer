import React, { useRef, useState } from 'react';
import { usePlayer } from '../store/playerStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { parseSongFile, formatTime } from '../utils/audioUtils';
import { v4 as uuidv4 } from 'uuid';

const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>;
const TagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const LyricIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

export default function LibraryView() {
  const { state, dispatch } = usePlayer();
  const { library, queue, currentIndex } = state;
  const { play } = useAudioEngine();
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const handleFiles = async (files) => {
    setLoading(true);
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|flac|ogg|m4a|wav|aac)$/i));
    const parsed = await Promise.all(audioFiles.map(parseSongFile));
    dispatch({ type: 'ADD_SONGS', payload: parsed });
    setLoading(false);
  };

  const playSong = (song) => {
    dispatch({ type: 'SET_QUEUE', payload: library, index: library.indexOf(song) });
    dispatch({ type: 'SET_PLAYING', payload: true });
    dispatch({ type: 'SET_VIEW', payload: 'now-playing' });
  };

  const removeSong = (e, id) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_SONG', payload: id });
  };

  const currentId = queue[currentIndex]?.id;

  return (
    <div>
      <div className="page-header">
        <h2>Library</h2>
        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={() => fileInputRef.current.click()}>
          <PlusIcon /> Add Songs
        </button>
        <input ref={fileInputRef} type="file" accept="audio/*" multiple hidden
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {library.length === 0 && (
        <div
          className={`upload-zone ${drag ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        >
          <div className="icon">🎵</div>
          <p>Drop audio files here or tap to browse<br /><span style={{ fontSize: '0.8rem' }}>MP3, FLAC, M4A, OGG, WAV supported</span></p>
        </div>
      )}

      {loading && <div className="loading"><span/><span/><span/></div>}

      <div>
        {library.map((song, i) => (
          <div key={song.id} className={`song-row ${song.id === currentId ? 'active' : ''}`}
            onClick={() => playSong(song)}>
            <div className="cover-art" style={{ width: 44, height: 44 }}>
              {song.cover ? <img src={song.cover} alt="" /> : <div className="placeholder">♪</div>}
            </div>
            <div className="song-info">
              <div className="song-title">{song.title}</div>
              <div className="song-meta">{song.artist} · {song.album}</div>
            </div>
            <div className="song-actions" onClick={e => e.stopPropagation()}>
              <button className="btn-icon" title="Edit Tags"
                onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'tag-editor', song })}>
                <TagIcon />
              </button>
              <button className="btn-icon" title="Edit Lyrics"
                onClick={() => dispatch({ type: 'OPEN_MODAL', modal: 'lyrics-editor', song })}>
                <LyricIcon />
              </button>
              <button className="btn-icon" title="Remove" style={{ color: 'var(--danger)' }}
                onClick={e => removeSong(e, song.id)}>
                <TrashIcon />
              </button>
            </div>
            <div className="song-duration">{formatTime(song.duration)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

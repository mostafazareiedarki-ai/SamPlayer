import React from 'react';
import { usePlayer } from '../store/playerStore';

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);
const AlbumIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function NavBar() {
  const { state, dispatch } = usePlayer();
  const { view } = state;

  const nav = (v) => dispatch({ type: 'SET_VIEW', payload: v });

  return (
    <nav className="nav-bar">
      <button className={`nav-item ${view === 'library' ? 'active' : ''}`} onClick={() => nav('library')}>
        <MusicIcon />
        Songs
      </button>
      <button className={`nav-item ${view === 'albums' || view === 'album-detail' ? 'active' : ''}`} onClick={() => nav('albums')}>
        <AlbumIcon />
        Albums
      </button>
    </nav>
  );
}

import React, { useEffect, useRef } from 'react';
import { PlayerProvider, usePlayer } from './store/playerStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import LibraryView from './components/LibraryView';
import AlbumsView from './components/AlbumsView';
import AlbumDetailView from './components/AlbumDetailView';
import NowPlayingView from './components/NowPlayingView';
import MiniPlayer from './components/MiniPlayer';
import NavBar from './components/NavBar';
import TagEditorModal from './components/TagEditorModal';
import LyricsEditorModal from './components/LyricsEditorModal';
import './App.css';

function AppInner() {
  const { state, dispatch, audioRef } = usePlayer();
  const { view, activeModal } = state;
  const { bindEvents } = useAudioEngine();

  const audioElRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audioElRef.current = audio;
    bindEvents(audio);
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  return (
    <div className="app">
      <div className="view-container">
        {view === 'library' && <LibraryView />}
        {view === 'albums' && <AlbumsView />}
        {view === 'album-detail' && <AlbumDetailView />}
        {view === 'now-playing' && <NowPlayingView />}
      </div>

      {view !== 'now-playing' && <MiniPlayer />}
      <NavBar />

      {activeModal === 'tag-editor' && <TagEditorModal />}
      {activeModal === 'lyrics-editor' && <LyricsEditorModal />}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppInner />
    </PlayerProvider>
  );
}

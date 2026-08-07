import { createContext, useContext, useReducer, useRef } from 'react';

const PlayerContext = createContext(null);

const initialState = {
  library: [],       // all songs
  albums: [],        // grouped albums
  queue: [],         // current play queue
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'none',   // 'none' | 'one' | 'all'
  view: 'library',  // 'library' | 'albums' | 'album-detail' | 'now-playing' | 'lyrics'
  selectedAlbum: null,
  activeModal: null, // 'tag-editor' | 'cover-picker' | 'lyrics-editor' | null
  editingSong: null,
  lyricsHighlight: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LIBRARY':
      return { ...state, library: action.payload, albums: buildAlbums(action.payload) };
    case 'ADD_SONGS':
      const merged = mergeSongs(state.library, action.payload);
      return { ...state, library: merged, albums: buildAlbums(merged) };
    case 'UPDATE_SONG':
      const updated = state.library.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s);
      return { ...state, library: updated, albums: buildAlbums(updated),
        queue: state.queue.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    case 'REMOVE_SONG':
      const filtered = state.library.filter(s => s.id !== action.payload);
      return { ...state, library: filtered, albums: buildAlbums(filtered) };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload, currentIndex: action.index ?? 0 };
    case 'SET_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'TOGGLE_REPEAT':
      const next = state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none';
      return { ...state, repeat: next };
    case 'SET_VIEW':
      return { ...state, view: action.payload, selectedAlbum: action.album ?? state.selectedAlbum };
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.modal, editingSong: action.song ?? null };
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null, editingSong: null };
    case 'SET_LYRICS_HIGHLIGHT':
      return { ...state, lyricsHighlight: action.payload };
    default:
      return state;
  }
}

function buildAlbums(songs) {
  const map = {};
  songs.forEach(song => {
    const key = song.album || 'Unknown Album';
    if (!map[key]) map[key] = { name: key, artist: song.albumArtist || song.artist || 'Unknown', cover: song.cover, songs: [] };
    map[key].songs.push(song);
    if (song.cover && !map[key].cover) map[key].cover = song.cover;
  });
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}

function mergeSongs(existing, incoming) {
  const ids = new Set(existing.map(s => s.id));
  return [...existing, ...incoming.filter(s => !ids.has(s.id))];
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(null);
  return (
    <PlayerContext.Provider value={{ state, dispatch, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

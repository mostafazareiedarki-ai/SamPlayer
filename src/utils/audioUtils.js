import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

const db = localforage.createInstance({ name: 'sam-player' });

export async function parseSongFile(file) {
  const url = URL.createObjectURL(file);
  const id = uuidv4();

  return new Promise((resolve) => {
    try {
      window.jsmediatags.read(file, {
        onSuccess(tag) {
          const t = tag.tags;
          let cover = null;
          if (t.picture) {
            const { data, format } = t.picture;
            const bytes = new Uint8Array(data);
            const blob = new Blob([bytes], { type: format });
            cover = URL.createObjectURL(blob);
          }
          resolve({
            id,
            url,
            file,
            title: t.title || file.name.replace(/\.[^.]+$/, ''),
            artist: t.artist || 'Unknown Artist',
            album: t.album || 'Unknown Album',
            albumArtist: t.TPE2?.data || t.artist || 'Unknown Artist',
            year: t.year || '',
            genre: t.genre || '',
            track: t.track || '',
            cover,
            lyrics: '',
            duration: 0,
          });
        },
        onError() {
          resolve({
            id,
            url,
            file,
            title: file.name.replace(/\.[^.]+$/, ''),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            albumArtist: 'Unknown Artist',
            year: '',
            genre: '',
            track: '',
            cover: null,
            lyrics: '',
            duration: 0,
          });
        }
      });
    } catch {
      resolve({
        id,
        url,
        file,
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        albumArtist: 'Unknown Artist',
        year: '',
        genre: '',
        track: '',
        cover: null,
        lyrics: '',
        duration: 0,
      });
    }
  });
}

export async function saveLibrary(songs) {
  const storable = songs.map(s => ({
    ...s,
    url: null,
    file: null,
  }));
  await db.setItem('library', storable);
}

export async function loadLibrary() {
  return (await db.getItem('library')) || [];
}

export function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function parseLyrics(lyricsText) {
  // Parse LRC format: [mm:ss.xx] Line of lyrics
  if (!lyricsText) return [];
  const lines = lyricsText.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let match;
    const times = [];
    let text = trimmed;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      times.push(min * 60 + sec + ms / 1000);
      text = trimmed.substring(timeRegex.lastIndex).trim();
    }

    if (times.length > 0 && text) {
      times.forEach(t => parsed.push({ time: t, text }));
    } else if (!times.length && trimmed && !trimmed.startsWith('[')) {
      parsed.push({ time: null, text: trimmed });
    }
  });

  return parsed.sort((a, b) => (a.time ?? 999999) - (b.time ?? 999999));
}

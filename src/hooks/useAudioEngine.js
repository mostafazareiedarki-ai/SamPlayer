import { useEffect, useCallback } from 'react';
import { usePlayer } from '../store/playerStore';
import { parseLyrics } from '../utils/audioUtils';

export function useAudioEngine() {
  const { state, dispatch, audioRef } = usePlayer();
  const { queue, currentIndex, isPlaying, volume, repeat, shuffle } = state;

  const currentSong = queue[currentIndex] ?? null;

  // Load song when index changes
  useEffect(() => {
    if (!audioRef.current || !currentSong?.url) return;
    audioRef.current.src = currentSong.url;
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentIndex, currentSong?.url]);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Lyrics sync
  useEffect(() => {
    if (!currentSong?.lyrics || !isPlaying) return;
    const lyrics = parseLyrics(currentSong.lyrics);
    const timed = lyrics.filter(l => l.time !== null);
    if (!timed.length) return;

    const interval = setInterval(() => {
      const ct = audioRef.current?.currentTime ?? 0;
      let active = 0;
      for (let i = 0; i < timed.length; i++) {
        if (ct >= timed[i].time) active = i;
        else break;
      }
      dispatch({ type: 'SET_LYRICS_HIGHLIGHT', payload: active });
    }, 250);

    return () => clearInterval(interval);
  }, [currentSong?.lyrics, isPlaying]);

  const bindEvents = useCallback((audio) => {
    if (!audio) return;
    audio.ontimeupdate = () => dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    audio.ondurationchange = () => dispatch({ type: 'SET_DURATION', payload: audio.duration });
    audio.onended = () => handleEnded();
    audio.onplay = () => dispatch({ type: 'SET_PLAYING', payload: true });
    audio.onpause = () => dispatch({ type: 'SET_PLAYING', payload: false });
  }, []);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    const nextIndex = shuffle
      ? Math.floor(Math.random() * queue.length)
      : currentIndex + 1;

    if (nextIndex < queue.length) {
      dispatch({ type: 'SET_INDEX', payload: nextIndex });
      dispatch({ type: 'SET_PLAYING', payload: true });
    } else if (repeat === 'all') {
      dispatch({ type: 'SET_INDEX', payload: 0 });
      dispatch({ type: 'SET_PLAYING', payload: true });
    } else {
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, [repeat, shuffle, currentIndex, queue.length]);

  const play = useCallback((songIndex) => {
    if (songIndex !== undefined) {
      dispatch({ type: 'SET_INDEX', payload: songIndex });
    }
    dispatch({ type: 'SET_PLAYING', payload: true });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', payload: false });
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    dispatch({ type: 'SET_TIME', payload: time });
  }, []);

  const playNext = useCallback(() => {
    const next = shuffle
      ? Math.floor(Math.random() * queue.length)
      : (currentIndex + 1) % queue.length;
    dispatch({ type: 'SET_INDEX', payload: next });
    dispatch({ type: 'SET_PLAYING', payload: true });
  }, [shuffle, currentIndex, queue.length]);

  const playPrev = useCallback(() => {
    if (audioRef.current?.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + queue.length) % queue.length;
    dispatch({ type: 'SET_INDEX', payload: prev });
    dispatch({ type: 'SET_PLAYING', payload: true });
  }, [currentIndex, queue.length]);

  return { currentSong, play, pause, seek, playNext, playPrev, bindEvents };
}

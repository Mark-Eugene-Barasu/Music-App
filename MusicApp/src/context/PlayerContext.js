import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'one' | 'all'
  const soundRef = useRef(null);

  const currentTrack = queue[currentIndex] ?? null;

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  async function loadAndPlay(track, trackQueue, index) {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setQueue(trackQueue);
    setCurrentIndex(index);
    setPosition(0);
    setDuration(0);

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.uri },
      { shouldPlay: true },
      onPlaybackStatus
    );
    soundRef.current = sound;
    setIsPlaying(true);
  }

  function onPlaybackStatus(status) {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);
    if (status.didJustFinish) handleTrackEnd();
  }

  async function handleTrackEnd() {
    if (repeatMode === 'one') {
      await soundRef.current?.replayAsync();
      return;
    }
    const next = currentIndex + 1;
    if (next < queue.length) {
      await loadAndPlay(queue[next], queue, next);
    } else if (repeatMode === 'all' && queue.length > 0) {
      await loadAndPlay(queue[0], queue, 0);
    } else {
      setIsPlaying(false);
    }
  }

  async function togglePlay() {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }

  async function seekTo(millis) {
    await soundRef.current?.setPositionAsync(millis);
  }

  async function skipNext() {
    const next = isShuffled
      ? Math.floor(Math.random() * queue.length)
      : currentIndex + 1;
    if (next < queue.length) await loadAndPlay(queue[next], queue, next);
  }

  async function skipPrev() {
    if (position > 3000) { await seekTo(0); return; }
    const prev = currentIndex - 1;
    if (prev >= 0) await loadAndPlay(queue[prev], queue, prev);
  }

  function toggleShuffle() { setIsShuffled(v => !v); }
  function toggleRepeat() {
    setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none');
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, currentIndex, isPlaying, position, duration,
      isShuffled, repeatMode,
      loadAndPlay, togglePlay, seekTo, skipNext, skipPrev,
      toggleShuffle, toggleRepeat,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);

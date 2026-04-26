import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useStats } from './StatsContext';

const PlayerContext = createContext(null);

const CROSSFADE_MS = 3000;

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
  const [qualityMode, setQualityMode] = useState('normal'); // 'saver' | 'normal' | 'hires'
  const [sleepTimer, setSleepTimer] = useState(null); // minutes remaining
  const sleepTimerRef = useRef(null);
  const soundRef = useRef(null);
  const nextSoundRef = useRef(null);
  const crossfadeRef = useRef(null);
  const playStartRef = useRef(null);
  const { recordPlay, recordListened } = useStats();

  const currentTrack = queue[currentIndex] ?? null;

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
      nextSoundRef.current?.unloadAsync();
      clearInterval(crossfadeRef.current);
      clearInterval(sleepTimerRef.current);
    };
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    clearInterval(sleepTimerRef.current);
    if (!sleepTimer) return;
    sleepTimerRef.current = setInterval(() => {
      setSleepTimer(prev => {
        if (prev <= 1) {
          clearInterval(sleepTimerRef.current);
          soundRef.current?.pauseAsync();
          setIsPlaying(false);
          return null;
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(sleepTimerRef.current);
  }, [sleepTimer]);

  function startSleepTimer(minutes) { setSleepTimer(minutes); }
  function cancelSleepTimer() { setSleepTimer(null); clearInterval(sleepTimerRef.current); }

  const getVolume = useCallback(() => normalizeAudio ? 0.85 : 1.0, [normalizeAudio]);

  async function loadAndPlay(track, trackQueue, index) {
    clearInterval(crossfadeRef.current);
    if (playStartRef.current && currentTrack) {
      recordListened(currentTrack, Date.now() - playStartRef.current);
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (nextSoundRef.current) {
      await nextSoundRef.current.unloadAsync();
      nextSoundRef.current = null;
    }
    setQueue(trackQueue);
    setCurrentIndex(index);
    setPosition(0);
    setDuration(0);

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.uri },
      { shouldPlay: true, volume: getVolume() },
      onPlaybackStatus
    );
    soundRef.current = sound;
    setIsPlaying(true);
    recordPlay(track);
    playStartRef.current = Date.now();
  }

  function onPlaybackStatus(status) {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);

    // Crossfade trigger
    if (crossfadeEnabled && status.durationMillis && status.positionMillis > 0) {
      const remaining = status.durationMillis - status.positionMillis;
      if (remaining <= CROSSFADE_MS && remaining > 0) {
        triggerCrossfade(status.durationMillis);
      }
    }
    if (status.didJustFinish) handleTrackEnd();
  }

  async function triggerCrossfade(dur) {
    if (crossfadeRef.current) return; // already fading
    const nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) return;
    const nextTrack = queue[nextIdx];
    if (!nextTrack || nextSoundRef.current) return;

    const { sound: nextSound } = await Audio.Sound.createAsync(
      { uri: nextTrack.uri },
      { shouldPlay: true, volume: 0 }
    );
    nextSoundRef.current = nextSound;

    const steps = 30;
    const stepMs = CROSSFADE_MS / steps;
    let step = 0;
    crossfadeRef.current = setInterval(async () => {
      step++;
      const ratio = step / steps;
      await soundRef.current?.setVolumeAsync(Math.max(0, getVolume() * (1 - ratio)));
      await nextSoundRef.current?.setVolumeAsync(Math.min(getVolume(), getVolume() * ratio));
      if (step >= steps) {
        clearInterval(crossfadeRef.current);
        crossfadeRef.current = null;
      }
    }, stepMs);
  }

  async function handleTrackEnd() {
    clearInterval(crossfadeRef.current);
    crossfadeRef.current = null;
    if (playStartRef.current && currentTrack) {
      recordListened(currentTrack, Date.now() - playStartRef.current);
    }
    if (repeatMode === 'one') { await soundRef.current?.replayAsync(); return; }

    if (nextSoundRef.current) {
      // crossfade already loaded next track
      if (soundRef.current) { await soundRef.current.unloadAsync(); }
      soundRef.current = nextSoundRef.current;
      nextSoundRef.current = null;
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      await soundRef.current.setStatusAsync({ progressUpdateIntervalMillis: 500 });
      soundRef.current.setOnPlaybackStatusUpdate(onPlaybackStatus);
      recordPlay(queue[nextIdx]);
      playStartRef.current = Date.now();
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

  async function seekTo(millis) { await soundRef.current?.setPositionAsync(millis); }

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

  function addToQueue(track) {
    setQueue(prev => [...prev, track]);
  }

  function playNext(track) {
    setQueue(prev => {
      const next = [...prev];
      next.splice(currentIndex + 1, 0, track);
      return next;
    });
  }

  function removeFromQueue(index) {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }

  function toggleShuffle() { setIsShuffled(v => !v); }
  function toggleRepeat() {
    setRepeatMode(m => m === 'none' ? 'all' : m === 'all' ? 'one' : 'none');
  }
  function toggleNormalize() { setNormalizeAudio(v => !v); }
  function toggleCrossfade() { setCrossfadeEnabled(v => !v); }
  function cycleQualityMode() {
    setQualityMode(m => m === 'saver' ? 'normal' : m === 'normal' ? 'hires' : 'saver');
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, currentIndex, isPlaying, position, duration,
      isShuffled, repeatMode, normalizeAudio, crossfadeEnabled, qualityMode, sleepTimer,
      loadAndPlay, togglePlay, seekTo, skipNext, skipPrev,
      toggleShuffle, toggleRepeat, toggleNormalize, toggleCrossfade, cycleQualityMode,
      addToQueue, playNext, removeFromQueue,
      startSleepTimer, cancelSleepTimer,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);

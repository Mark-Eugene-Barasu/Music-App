import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { load, save } from '../utils/storage';

const StatsContext = createContext(null);

const STATS_KEY = 'samplayer_stats';

export function StatsProvider({ children }) {
  const [stats, setStats] = useState({});
  const loaded = useRef(false);

  useEffect(() => {
    load(STATS_KEY, {}).then(s => { setStats(s); loaded.current = true; });
  }, []);

  function recordPlay(track) {
    if (!track) return;
    setStats(prev => {
      const entry = prev[track.id] ?? { id: track.id, title: track.title, artist: track.artist, count: 0, totalMs: 0 };
      const updated = { ...prev, [track.id]: { ...entry, count: entry.count + 1 } };
      if (loaded.current) save(STATS_KEY, updated);
      return updated;
    });
  }

  function recordListened(track, ms) {
    if (!track || ms < 5000) return;
    setStats(prev => {
      const entry = prev[track.id] ?? { id: track.id, title: track.title, artist: track.artist, count: 0, totalMs: 0 };
      const updated = { ...prev, [track.id]: { ...entry, totalMs: entry.totalMs + ms } };
      if (loaded.current) save(STATS_KEY, updated);
      return updated;
    });
  }

  function getWrapped() {
    const list = Object.values(stats);
    const topTracks = [...list].sort((a, b) => b.count - a.count).slice(0, 5);
    const topArtists = Object.values(
      list.reduce((acc, t) => {
        const key = t.artist ?? 'Unknown';
        acc[key] = acc[key] ?? { artist: key, count: 0 };
        acc[key].count += t.count;
        return acc;
      }, {})
    ).sort((a, b) => b.count - a.count).slice(0, 5);
    const totalMs = list.reduce((s, t) => s + (t.totalMs ?? 0), 0);
    const totalPlays = list.reduce((s, t) => s + t.count, 0);
    return { topTracks, topArtists, totalMs, totalPlays };
  }

  return (
    <StatsContext.Provider value={{ recordPlay, recordListened, getWrapped, stats }}>
      {children}
    </StatsContext.Provider>
  );
}

export const useStats = () => useContext(StatsContext);

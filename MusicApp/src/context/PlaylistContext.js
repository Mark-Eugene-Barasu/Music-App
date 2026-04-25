import React, { createContext, useContext, useEffect, useState } from 'react';
import { load, save } from '../utils/storage';

const PlaylistContext = createContext(null);
const KEY = 'samplayer_playlists';

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => { load(KEY, []).then(setPlaylists); }, []);

  function persist(updated) { setPlaylists(updated); save(KEY, updated); }

  function createPlaylist(name) {
    const p = { id: Date.now().toString(), name, trackIds: [], createdAt: Date.now() };
    persist([...playlists, p]);
    return p;
  }

  function deletePlaylist(id) { persist(playlists.filter(p => p.id !== id)); }

  function renamePlaylist(id, name) {
    persist(playlists.map(p => p.id === id ? { ...p, name } : p));
  }

  function addTrackToPlaylist(playlistId, trackId) {
    persist(playlists.map(p =>
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    ));
  }

  function removeTrackFromPlaylist(playlistId, trackId) {
    persist(playlists.map(p =>
      p.id === playlistId ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) } : p
    ));
  }

  return (
    <PlaylistContext.Provider value={{ playlists, createPlaylist, deletePlaylist, renamePlaylist, addTrackToPlaylist, removeTrackFromPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export const usePlaylists = () => useContext(PlaylistContext);

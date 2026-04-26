import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { load, save } from '../utils/storage';

const CACHE_DIR = FileSystem.cacheDirectory + 'gomusic_tracks/';
const OFFLINE_KEY = 'gomusic_offline_map'; // { trackId: localUri }

export function useMediaLibrary() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { loadTracks(); }, []);

  async function ensureCacheDir() {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }

  async function loadTracks() {
    setLoading(true);
    setError(null);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') { setLoading(false); return; }

      let all = [];
      let after = null;
      let hasMore = true;

      while (hasMore) {
        const page = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: 100,
          after,
        });
        all = [...all, ...page.assets];
        setLoadingCount(all.length);
        hasMore = page.hasNextPage;
        after = page.endCursor;
      }

      const offlineMap = await load(OFFLINE_KEY, {});

      const mapped = all.map(a => ({
        id: a.id,
        title: a.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: a.duration * 1000,
        uri: offlineMap[a.id] ?? a.uri, // prefer cached local copy
        originalUri: a.uri,
        artwork: null,
        cached: !!offlineMap[a.id],
      }));

      setTracks(mapped);
    } catch (e) {
      console.error('loadTracks error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-download top N tracks by play count
  async function autoDownloadTop(stats, n = 50) {
    try {
      await ensureCacheDir();
      const offlineMap = await load(OFFLINE_KEY, {});

      const topIds = Object.values(stats)
        .sort((a, b) => b.count - a.count)
        .slice(0, n)
        .map(s => s.id);

      for (const id of topIds) {
        if (offlineMap[id]) continue; // already cached
        const track = tracks.find(t => t.id === id);
        if (!track) continue;
        const dest = CACHE_DIR + id + '.mp3';
        const info = await FileSystem.getInfoAsync(dest);
        if (!info.exists) {
          await FileSystem.copyAsync({ from: track.originalUri ?? track.uri, to: dest });
        }
        offlineMap[id] = dest;
      }

      await save(OFFLINE_KEY, offlineMap);

      // Update track URIs in state
      setTracks(prev => prev.map(t => ({
        ...t,
        uri: offlineMap[t.id] ?? t.uri,
        cached: !!offlineMap[t.id],
      })));
    } catch (e) {
      console.warn('autoDownload error:', e.message);
    }
  }

  return { tracks, loading, loadingCount, permissionStatus, error, reload: loadTracks, autoDownloadTop };
}

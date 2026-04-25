import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useMediaLibrary() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTracks();
  }, []);

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

      setTracks(all.map((a, i) => ({
        id: a.id,
        title: a.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        duration: a.duration * 1000,
        uri: a.uri,
        artwork: null,
      })));
    } catch (e) {
      console.error('loadTracks error:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { tracks, loading, loadingCount, permissionStatus, error, reload: loadTracks };
}

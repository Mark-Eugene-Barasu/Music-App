import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useMediaLibrary() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') { setLoading(false); return; }

    let all = [];
    let after = null;
    let hasMore = true;

    while (hasMore) {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 100,
        after,
      });
      all = [...all, ...page.assets];
      setLoadingCount(all.length);
      hasMore = page.hasNextPage;
      after = page.endCursor;
    }

    const formatted = all.map(a => ({
      id: a.id,
      title: a.filename.replace(/\.[^/.]+$/, ''),
      artist: a.albumId ?? 'Unknown Artist',
      duration: a.duration * 1000,
      uri: a.uri,
      artwork: null,
    }));

    setTracks(formatted);
    setLoading(false);
  }

  return { tracks, loading, loadingCount, permissionStatus, reload: loadTracks };
}

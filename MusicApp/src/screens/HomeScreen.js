import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useStats } from '../context/StatsContext';
import { useTheme } from '../context/ThemeContext';
import { load, save } from '../utils/storage';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import { HintBar, NewBadge } from '../components/HintBar';

const HINT_KEY = 'gomusic_hint_longpress';
const BADGE_KEY = 'gomusic_badge_settings';

export default function HomeScreen({ navigation }) {
  const { tracks, loading, loadingCount, permissionStatus, error, reload, autoDownloadTop } = useMediaLibrary();
  const { loadAndPlay, currentTrack, addToQueue, playNext } = usePlayer();
  const { playlists, addTrackToPlaylist } = usePlaylists();
  const { stats } = useStats();
  const { palette } = useTheme();

  const [showHint, setShowHint] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    load(HINT_KEY, false).then(seen => setShowHint(!seen));
    load(BADGE_KEY, false).then(seen => setShowBadge(!seen));
  }, []);

  useEffect(() => {
    if (!loading && tracks.length > 0 && Object.keys(stats).length > 0) {
      autoDownloadTop(stats, 50);
    }
  }, [loading, tracks.length]);

  function dismissHint() { setShowHint(false); save(HINT_KEY, true); }
  function dismissBadge() { setShowBadge(false); save(BADGE_KEY, true); }

  function handleLongPress(track) {
    Alert.alert(track.title, null, [
      { text: 'Play Next', onPress: () => playNext(track) },
      { text: 'Add to Queue', onPress: () => addToQueue(track) },
      ...playlists.map(p => ({ text: `Add to "${p.name}"`, onPress: () => addTrackToPlaylist(p.id, track.id) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: palette.bg }]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={[styles.loadingText, { color: palette.textSub }]}>
          {loadingCount > 0 ? `Found ${loadingCount} songs...` : 'Loading your music...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: palette.bg }]}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={[styles.permText, { color: palette.text }]}>Failed to load music</Text>
        <Text style={[styles.permSub, { color: palette.textSub }]}>{error}</Text>
        <TouchableOpacity onPress={reload} style={[styles.retryBtn, { backgroundColor: palette.accent }]}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={[styles.center, { backgroundColor: palette.bg }]}>
        <Ionicons name="lock-closed" size={48} color={palette.textMuted} />
        <Text style={[styles.permText, { color: palette.text }]}>Storage permission required</Text>
        <Text style={[styles.permSub, { color: palette.textSub }]}>Please grant access to your music files</Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: palette.bg }]}>
        <Ionicons name="musical-notes" size={64} color={palette.bg3} />
        <Text style={[styles.permText, { color: palette.text }]}>No music found</Text>
        <Text style={[styles.permSub, { color: palette.textSub }]}>Add audio files to your device</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: palette.accent }]}>Go-Music</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={palette.text} />
          </TouchableOpacity>

          {/* Settings icon with optional pulsing NEW badge */}
          <TouchableOpacity
            onPress={() => { dismissBadge(); navigation.navigate('Settings'); }}
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color={palette.text} />
            {showBadge && <NewBadge />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Long-press hint */}
      {showHint && (
        <HintBar
          icon="hand-left"
          text="Long-press any song to add it to the queue, play next, or save to a playlist."
          onDismiss={dismissHint}
        />
      )}

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <TrackItem
            track={item}
            isActive={currentTrack?.id === item.id}
            onPress={() => { loadAndPlay(item, tracks, index); navigation.navigate('Player'); }}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{tracks.length} Songs</Text>
        }
        contentContainerStyle={{ paddingBottom: 8 }}
      />
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 2 },
  sectionLabel: { fontSize: 13, paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 1 },
  loadingText: { marginTop: 12, fontSize: 15 },
  permText: { fontSize: 18, fontWeight: '600' },
  permSub: { fontSize: 14 },
  retryBtn: { marginTop: 16, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

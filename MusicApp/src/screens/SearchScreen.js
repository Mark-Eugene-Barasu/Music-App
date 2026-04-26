import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useTheme } from '../context/ThemeContext';
import { load, save } from '../utils/storage';
import { buildFuse, fuzzySearch } from '../utils/fuzzy';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import { HintBar } from '../components/HintBar';

const SEARCH_HINT_KEY = 'gomusic_hint_search';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [showHint, setShowHint] = useState(false);
  const { tracks, loading } = useMediaLibrary();
  const { loadAndPlay, currentTrack, addToQueue, playNext } = usePlayer();
  const { playlists, addTrackToPlaylist } = usePlaylists();
  const { palette } = useTheme();

  useMemo(() => { load(SEARCH_HINT_KEY, false).then(seen => setShowHint(!seen)); }, []);
  function dismissHint() { setShowHint(false); save(SEARCH_HINT_KEY, true); }

  const fuse = useMemo(() => buildFuse(tracks), [tracks]);
  const results = useMemo(() => fuzzySearch(fuse, query), [fuse, query]);

  function handleLongPress(track) {
    Alert.alert(track.title, null, [
      { text: 'Play Next', onPress: () => playNext(track) },
      { text: 'Add to Queue', onPress: () => addToQueue(track) },
      ...playlists.map(p => ({ text: `Add to "${p.name}"`, onPress: () => addTrackToPlaylist(p.id, track.id) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <Text style={[styles.header, { color: palette.text }]}>Search</Text>

      {showHint && (
        <HintBar
          icon="search"
          text="Fuzzy search is enabled — typos are OK! Try searching by song title or artist name."
          onDismiss={dismissHint}
        />
      )}
      <View style={[styles.inputRow, { backgroundColor: palette.bg2 }]}>
        <Ionicons name="search" size={18} color={palette.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: palette.text }]}
          placeholder="Songs, artists, filenames..."
          placeholderTextColor={palette.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Ionicons name="close-circle" size={18} color={palette.textMuted} onPress={() => setQuery('')} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
      ) : query.trim() === '' ? (
        <View style={styles.hint}>
          <Ionicons name="musical-notes-outline" size={48} color={palette.bg3} />
          <Text style={[styles.hintText, { color: palette.textMuted }]}>Search your music library</Text>
          <Text style={[styles.hintSub, { color: palette.textMuted }]}>Supports fuzzy search — typos are OK!</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <Text style={[styles.hintText, { color: palette.textMuted }]}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              isActive={currentTrack?.id === item.id}
              onPress={() => { loadAndPlay(item, results, index); navigation.navigate('Player'); }}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 26, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, marginBottom: 8 },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  hint: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hintText: { fontSize: 15 },
  hintSub: { fontSize: 13 },
});

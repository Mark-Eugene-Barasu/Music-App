import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { buildFuse, fuzzySearch } from '../utils/fuzzy';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const { tracks, loading } = useMediaLibrary();
  const { loadAndPlay, currentTrack, addToQueue, playNext } = usePlayer();
  const { playlists, addTrackToPlaylist } = usePlaylists();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Search</Text>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Songs, artists, filenames..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Ionicons name="close-circle" size={18} color="#666" onPress={() => setQuery('')} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#1DB954" style={{ marginTop: 40 }} />
      ) : query.trim() === '' ? (
        <View style={styles.hint}>
          <Ionicons name="musical-notes-outline" size={48} color="#333" />
          <Text style={styles.hintText}>Search your music library</Text>
          <Text style={styles.hintSub}>Supports fuzzy search — typos are OK!</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <Text style={styles.hintText}>No results for "{query}"</Text>
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
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { color: '#fff', fontSize: 26, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12,
    marginHorizontal: 16, paddingHorizontal: 12, marginBottom: 8,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12 },
  hint: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  hintText: { color: '#555', fontSize: 15 },
  hintSub: { color: '#333', fontSize: 13 },
});

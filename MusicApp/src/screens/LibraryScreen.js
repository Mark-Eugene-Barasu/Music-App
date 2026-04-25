import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';

const SORTS = ['Title', 'Artist', 'Duration'];

export default function LibraryScreen({ navigation }) {
  const [sortBy, setSortBy] = useState('Title');
  const { tracks, loading } = useMediaLibrary();
  const { loadAndPlay, currentTrack } = usePlayer();

  const sorted = useMemo(() => {
    return [...tracks].sort((a, b) => {
      if (sortBy === 'Title') return a.title.localeCompare(b.title);
      if (sortBy === 'Artist') return a.artist.localeCompare(b.artist);
      return a.duration - b.duration;
    });
  }, [tracks, sortBy]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Library</Text>

      <View style={styles.sortRow}>
        {SORTS.map(s => (
          <TouchableOpacity key={s} style={[styles.sortBtn, sortBy === s && styles.sortActive]} onPress={() => setSortBy(s)}>
            <Text style={[styles.sortText, sortBy === s && styles.sortTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#1DB954" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              isActive={currentTrack?.id === item.id}
              onPress={() => { loadAndPlay(item, sorted, index); navigation.navigate('Player'); }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="library-outline" size={48} color="#333" />
              <Text style={styles.emptyText}>Your library is empty</Text>
            </View>
          }
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
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1a1a1a' },
  sortActive: { backgroundColor: '#1DB954' },
  sortText: { color: '#888', fontSize: 13 },
  sortTextActive: { color: '#000', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#555', fontSize: 15 },
});

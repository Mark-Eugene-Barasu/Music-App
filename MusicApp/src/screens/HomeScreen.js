import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';

export default function HomeScreen({ navigation }) {
  const { tracks, loading, permissionStatus } = useMediaLibrary();
  const { loadAndPlay, currentTrack } = usePlayer();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading your music...</Text>
      </View>
    );
  }

  if (permissionStatus !== 'granted') {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={48} color="#666" />
        <Text style={styles.permText}>Storage permission required</Text>
        <Text style={styles.permSub}>Please grant access to your music files</Text>
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="musical-notes" size={64} color="#333" />
        <Text style={styles.permText}>No music found</Text>
        <Text style={styles.permSub}>Add audio files to your device</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BeatWave</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <TrackItem
            track={item}
            isActive={currentTrack?.id === item.id}
            onPress={() => { loadAndPlay(item, tracks, index); navigation.navigate('Player'); }}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>{tracks.length} Songs</Text>
        }
        contentContainerStyle={{ paddingBottom: 8 }}
      />
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#1DB954', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  sectionLabel: { color: '#666', fontSize: 13, paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 1 },
  loadingText: { color: '#888', marginTop: 12, fontSize: 15 },
  permText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  permSub: { color: '#666', fontSize: 14 },
});

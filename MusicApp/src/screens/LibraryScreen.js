import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';

const SORTS = ['Title', 'Artist', 'Duration'];
const TABS = ['Songs', 'Playlists'];

export default function LibraryScreen({ navigation }) {
  const [sortBy, setSortBy] = useState('Title');
  const [tab, setTab] = useState('Songs');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { tracks, loading } = useMediaLibrary();
  const { loadAndPlay, currentTrack, addToQueue, playNext } = usePlayer();
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylists();

  const sorted = useMemo(() => [...tracks].sort((a, b) => {
    if (sortBy === 'Title') return a.title.localeCompare(b.title);
    if (sortBy === 'Artist') return a.artist.localeCompare(b.artist);
    return a.duration - b.duration;
  }), [tracks, sortBy]);

  function handleLongPress(track) {
    Alert.alert(track.title, null, [
      { text: 'Play Next', onPress: () => playNext(track) },
      { text: 'Add to Queue', onPress: () => addToQueue(track) },
      ...playlists.map(p => ({ text: `Add to "${p.name}"`, onPress: () => addTrackToPlaylist(p.id, track.id) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleCreatePlaylist() {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowModal(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Library</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wrapped')}>
          <Ionicons name="stats-chart" size={22} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Songs' && (
        <>
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
                  onLongPress={() => handleLongPress(item)}
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
        </>
      )}

      {tab === 'Playlists' && (
        <>
          <TouchableOpacity style={styles.newPlaylist} onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle" size={20} color="#1DB954" />
            <Text style={styles.newPlaylistText}>New Playlist</Text>
          </TouchableOpacity>
          <FlatList
            data={playlists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.playlistItem} onPress={() => navigation.navigate('Playlist', { playlistId: item.id })}>
                <View style={styles.playlistIcon}>
                  <Ionicons name="musical-notes" size={22} color="#1DB954" />
                </View>
                <View>
                  <Text style={styles.playlistName}>{item.name}</Text>
                  <Text style={styles.playlistCount}>{item.trackIds.length} songs</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#444" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No playlists yet</Text>}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor="#555"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreatePlaylist} style={styles.modalCreate}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  header: { color: '#fff', fontSize: 26, fontWeight: '800' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a1a1a' },
  tabActive: { backgroundColor: '#1DB954' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1a1a1a' },
  sortActive: { backgroundColor: '#1DB954' },
  sortText: { color: '#888', fontSize: 13 },
  sortTextActive: { color: '#000', fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#555', fontSize: 15, textAlign: 'center', marginTop: 60 },
  newPlaylist: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  newPlaylistText: { color: '#1DB954', fontSize: 15, fontWeight: '600' },
  playlistItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', gap: 14 },
  playlistIcon: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  playlistName: { color: '#fff', fontSize: 15, fontWeight: '500' },
  playlistCount: { color: '#666', fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, width: '80%', gap: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalInput: { backgroundColor: '#0f0f0f', color: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 8 },
  modalCancelText: { color: '#666', fontSize: 15 },
  modalCreate: { backgroundColor: '#1DB954', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  modalCreateText: { color: '#000', fontWeight: '700', fontSize: 15 },
});

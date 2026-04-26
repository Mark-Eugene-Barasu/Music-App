import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useStats } from '../context/StatsContext';
import { useTheme } from '../context/ThemeContext';
import { load, save } from '../utils/storage';
import { getContextualPlaylists } from '../utils/contextualPlaylists';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import { HintBar } from '../components/HintBar';

const SORTS = ['Title', 'Artist', 'Duration'];
const TABS = ['Songs', 'Playlists', 'Smart'];
const SMART_HINT_KEY = 'gomusic_hint_smart';

export default function LibraryScreen({ navigation }) {
  const [sortBy, setSortBy] = useState('Title');
  const [tab, setTab] = useState('Songs');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { tracks, loading } = useMediaLibrary();
  const { loadAndPlay, currentTrack, addToQueue, playNext } = usePlayer();
  const { playlists, createPlaylist, addTrackToPlaylist } = usePlaylists();
  const { stats } = useStats();
  const { palette } = useTheme();
  const [showSmartHint, setShowSmartHint] = useState(false);

  useEffect(() => { load(SMART_HINT_KEY, false).then(seen => setShowSmartHint(!seen)); }, []);
  function dismissSmartHint() { setShowSmartHint(false); save(SMART_HINT_KEY, true); }

  const smartPlaylists = useMemo(() => getContextualPlaylists(tracks, stats), [tracks, stats]);
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
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: palette.text }]}>Library</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wrapped')}>
          <Ionicons name="stats-chart" size={22} color={palette.accent} />
        </TouchableOpacity>
      </View>

      {showSmartHint && tab === 'Songs' && (
        <HintBar
          icon="sparkles"
          text="New! Check the Smart tab for auto-generated playlists based on your listening habits."
          onDismiss={dismissSmartHint}
        />
      )}

      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, { backgroundColor: tab === t ? palette.accent : palette.bg2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? '#000' : palette.textSub }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Songs' && (
        <>
          <View style={styles.sortRow}>
            {SORTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.sortBtn, { backgroundColor: sortBy === s ? palette.accent : palette.bg2 }]}
                onPress={() => setSortBy(s)}
              >
                <Text style={[styles.sortText, { color: sortBy === s ? '#000' : palette.textSub, fontWeight: sortBy === s ? '700' : '400' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {loading ? (
            <ActivityIndicator color={palette.accent} style={{ marginTop: 40 }} />
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
                  <Ionicons name="library-outline" size={48} color={palette.bg3} />
                  <Text style={[styles.emptyText, { color: palette.textMuted }]}>Your library is empty</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 8 }}
            />
          )}
        </>
      )}

      {tab === 'Playlists' && (
        <>
          <TouchableOpacity style={[styles.newPlaylist, { borderBottomColor: palette.border }]} onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle" size={20} color={palette.accent} />
            <Text style={[styles.newPlaylistText, { color: palette.accent }]}>New Playlist</Text>
          </TouchableOpacity>
          <FlatList
            data={playlists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.playlistItem, { borderBottomColor: palette.border }]} onPress={() => navigation.navigate('Playlist', { playlistId: item.id })}>
                <View style={[styles.playlistIcon, { backgroundColor: palette.bg2 }]}>
                  <Ionicons name="musical-notes" size={22} color={palette.accent} />
                </View>
                <View>
                  <Text style={[styles.playlistName, { color: palette.text }]}>{item.name}</Text>
                  <Text style={[styles.playlistCount, { color: palette.textSub }]}>{item.trackIds.length} songs</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.textMuted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: palette.textMuted }]}>No playlists yet</Text>}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </>
      )}

      {tab === 'Smart' && (
        <FlatList
          data={smartPlaylists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.playlistItem, { borderBottomColor: palette.border }]}
              onPress={() => item.tracks.length > 0 && loadAndPlay(item.tracks[0], item.tracks, 0)}
            >
              <View style={[styles.playlistIcon, { backgroundColor: palette.bg2 }]}>
                <Ionicons name="sparkles" size={22} color={palette.accent} />
              </View>
              <View>
                <Text style={[styles.playlistName, { color: palette.text }]}>{item.name}</Text>
                <Text style={[styles.playlistCount, { color: palette.textSub }]}>{item.tracks.length} songs · Auto-generated</Text>
              </View>
              <Ionicons name="play-circle" size={26} color={palette.accent} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: palette.card }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>New Playlist</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: palette.bg, color: palette.text }]}
              placeholder="Playlist name"
              placeholderTextColor={palette.textMuted}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCancel}>
                <Text style={[styles.modalCancelText, { color: palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreatePlaylist} style={[styles.modalCreate, { backgroundColor: palette.accent }]}>
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
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  header: { fontSize: 26, fontWeight: '800' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  tabText: { fontSize: 14, fontWeight: '600' },
  sortRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  sortText: { fontSize: 13 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', marginTop: 60 },
  newPlaylist: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  newPlaylistText: { fontSize: 15, fontWeight: '600' },
  playlistItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  playlistIcon: { width: 46, height: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  playlistName: { fontSize: 15, fontWeight: '500' },
  playlistCount: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modal: { borderRadius: 16, padding: 24, width: '80%', gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalInput: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 8 },
  modalCancelText: { fontSize: 15 },
  modalCreate: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  modalCreateText: { color: '#000', fontWeight: '700', fontSize: 15 },
});

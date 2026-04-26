import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useTheme } from '../context/ThemeContext';
import TrackItem from '../components/TrackItem';

export default function PlaylistScreen({ route, navigation }) {
  const { playlistId } = route.params;
  const { playlists, renamePlaylist, deletePlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { loadAndPlay, currentTrack } = usePlayer();
  const { tracks } = useMediaLibrary();
  const { palette } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return null;

  const playlistTracks = playlist.trackIds
    .map(id => tracks.find(t => t.id === id))
    .filter(Boolean);

  function handleRename() {
    if (editing && name.trim()) renamePlaylist(playlistId, name.trim());
    setEditing(v => !v);
    setName(playlist.name);
  }

  function handleDelete() {
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deletePlaylist(playlistId); navigation.goBack(); } },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </TouchableOpacity>
        {editing
          ? <TextInput style={[styles.input, { color: palette.text, borderBottomColor: palette.accent }]} value={name} onChangeText={setName} autoFocus />
          : <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>{playlist.name}</Text>}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRename} style={styles.iconBtn}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={20} color={palette.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Ionicons name="trash" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {playlistTracks.length > 0 && (
        <TouchableOpacity style={[styles.playAll, { backgroundColor: palette.accent }]} onPress={() => loadAndPlay(playlistTracks[0], playlistTracks, 0)}>
          <Ionicons name="play-circle" size={20} color="#000" />
          <Text style={styles.playAllText}>Play All</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={playlistTracks}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <TrackItem
            track={item}
            isActive={currentTrack?.id === item.id}
            onPress={() => { loadAndPlay(item, playlistTracks, index); navigation.navigate('Player'); }}
            onLongPress={() => Alert.alert('Remove', `Remove "${item.title}" from playlist?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeTrackFromPlaylist(playlistId, item.id) },
            ])}
          />
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: palette.textMuted }]}>No tracks yet. Long-press a song to add it.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 8, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  input: { flex: 1, fontSize: 18, fontWeight: '700', borderBottomWidth: 1, paddingVertical: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginVertical: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, alignSelf: 'flex-start' },
  playAllText: { color: '#000', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 14, paddingHorizontal: 32 },
});

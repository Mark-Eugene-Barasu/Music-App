import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import TrackItem from '../components/TrackItem';

export default function PlaylistScreen({ route, navigation }) {
  const { playlistId } = route.params;
  const { playlists, renamePlaylist, deletePlaylist, removeTrackFromPlaylist } = usePlaylists();
  const { loadAndPlay, currentTrack } = usePlayer();
  const { tracks } = useMediaLibrary();
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        {editing
          ? <TextInput style={styles.input} value={name} onChangeText={setName} autoFocus />
          : <Text style={styles.title} numberOfLines={1}>{playlist.name}</Text>}
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRename} style={styles.iconBtn}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={20} color="#1DB954" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Ionicons name="trash" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      {playlistTracks.length > 0 && (
        <TouchableOpacity style={styles.playAll} onPress={() => loadAndPlay(playlistTracks[0], playlistTracks, 0)}>
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
        ListEmptyComponent={<Text style={styles.empty}>No tracks yet. Long-press a song to add it.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1 },
  input: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: '#1DB954', paddingVertical: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1DB954', marginHorizontal: 16, marginBottom: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, alignSelf: 'flex-start' },
  playAllText: { color: '#000', fontWeight: '700', fontSize: 14 },
  empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 14, paddingHorizontal: 32 },
});

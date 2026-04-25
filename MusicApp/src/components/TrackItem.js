import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../utils/formatTime';

export default function TrackItem({ track, onPress, onLongPress, isActive }) {
  return (
    <TouchableOpacity style={[styles.container, isActive && styles.active]} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.artwork}>
        {track.artwork
          ? <Image source={{ uri: track.artwork }} style={styles.artImg} />
          : <Ionicons name="musical-note" size={18} color={isActive ? '#1DB954' : '#666'} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={styles.duration}>{formatTime(track.duration)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  active: { backgroundColor: '#1a1a2e' },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  artImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '500' },
  activeText: { color: '#1DB954' },
  artist: { color: '#888', fontSize: 13, marginTop: 2 },
  duration: { color: '#666', fontSize: 12 },
});

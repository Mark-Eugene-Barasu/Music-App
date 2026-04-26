import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../utils/formatTime';
import { useTheme } from '../context/ThemeContext';

export default function TrackItem({ track, onPress, onLongPress, isActive }) {
  const { palette } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: palette.border }, isActive && { backgroundColor: palette.bg2 }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.artwork, { backgroundColor: palette.bg3 }]}>
        {track.artwork
          ? <Image source={{ uri: track.artwork }} style={styles.artImg} />
          : <Ionicons name="musical-note" size={18} color={isActive ? palette.accent : palette.textMuted} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: isActive ? palette.accent : palette.text }]} numberOfLines={1}>{track.title}</Text>
        <Text style={[styles.artist, { color: palette.textSub }]} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Text style={[styles.duration, { color: palette.textMuted }]}>{formatTime(track.duration)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  artwork: { width: 46, height: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden' },
  artImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '500' },
  artist: { fontSize: 13, marginTop: 2 },
  duration: { fontSize: 12 },
});

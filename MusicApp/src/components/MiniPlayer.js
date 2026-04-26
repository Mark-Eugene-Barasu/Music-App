import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, skipNext } = usePlayer();
  const { palette } = useTheme();
  const navigation = useNavigation();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: palette.miniPlayer, borderTopColor: palette.border }]}
      onPress={() => navigation.navigate('Player')}
      activeOpacity={0.9}
    >
      <View style={[styles.artwork, { backgroundColor: palette.bg3 }]}>
        {currentTrack.artwork
          ? <Image source={{ uri: currentTrack.artwork }} style={styles.artImg} />
          : <Ionicons name="musical-note" size={20} color={palette.accent} />}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={[styles.artist, { color: palette.textSub }]} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <TouchableOpacity onPress={e => { e.stopPropagation?.(); togglePlay(); }} style={styles.btn}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color={palette.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={e => { e.stopPropagation?.(); skipNext(); }} style={styles.btn}>
        <Ionicons name="play-skip-forward" size={22} color={palette.textSub} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  artwork: { width: 42, height: 42, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  artImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600' },
  artist: { fontSize: 12, marginTop: 2 },
  btn: { padding: 6 },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useNavigation } from '@react-navigation/native';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const navigation = useNavigation();

  if (!currentTrack) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Player')} activeOpacity={0.9}>
      <View style={styles.artwork}>
        {currentTrack.artwork
          ? <Image source={{ uri: currentTrack.artwork }} style={styles.artImg} />
          : <Ionicons name="musical-note" size={20} color="#1DB954" />}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <TouchableOpacity onPress={togglePlay} style={styles.btn}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  artImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '600' },
  artist: { color: '#888', fontSize: 12, marginTop: 2 },
  btn: { padding: 6 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ navigation }) {
  const {
    currentTrack, isPlaying, position, duration,
    togglePlay, seekTo, skipNext, skipPrev,
    isShuffled, repeatMode, toggleShuffle, toggleRepeat,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Ionicons name="musical-notes" size={64} color="#333" />
          <Text style={styles.emptyText}>Nothing playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const repeatIcon = repeatMode === 'one' ? 'repeat-outline' : 'repeat';
  const repeatColor = repeatMode === 'none' ? '#555' : '#1DB954';

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="chevron-down" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.artworkContainer}>
        {currentTrack.artwork
          ? <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          : (
            <View style={styles.artworkPlaceholder}>
              <Ionicons name="musical-note" size={80} color="#1DB954" />
            </View>
          )}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#333"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Ionicons name="shuffle" size={24} color={isShuffled ? '#1DB954' : '#555'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipPrev}>
          <Ionicons name="play-skip-back" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipNext}>
          <Ionicons name="play-skip-forward" size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleRepeat}>
          <Ionicons name={repeatIcon} size={24} color={repeatColor} />
          {repeatMode === 'one' && (
            <Text style={styles.repeatOne}>1</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 24 },
  backBtn: { paddingVertical: 12, alignSelf: 'flex-start' },
  artworkContainer: { alignItems: 'center', marginTop: 20, marginBottom: 36 },
  artwork: { width: width - 80, height: width - 80, borderRadius: 16 },
  artworkPlaceholder: {
    width: width - 80, height: width - 80, borderRadius: 16,
    backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  artist: { color: '#888', fontSize: 16, marginTop: 4 },
  sliderContainer: { marginBottom: 24 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  time: { color: '#666', fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#666', fontSize: 16 },
  repeatOne: { color: '#1DB954', fontSize: 9, textAlign: 'center', marginTop: -4 },
});

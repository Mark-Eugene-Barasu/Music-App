import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatTime';

const { width } = Dimensions.get('window');
const SLEEP_OPTIONS = [5, 10, 15, 30, 45, 60];

export default function PlayerScreen({ navigation }) {
  const {
    currentTrack, isPlaying, position, duration,
    togglePlay, seekTo, skipNext, skipPrev,
    isShuffled, repeatMode, toggleShuffle, toggleRepeat,
    normalizeAudio, toggleNormalize,
    crossfadeEnabled, toggleCrossfade,
    sleepTimer, startSleepTimer, cancelSleepTimer,
  } = usePlayer();

  const [showSettings, setShowSettings] = useState(false);
  const [showSleep, setShowSleep] = useState(false);

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
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topActions}>
          {sleepTimer && (
            <TouchableOpacity onPress={cancelSleepTimer} style={styles.sleepBadge}>
              <Ionicons name="moon" size={14} color="#1DB954" />
              <Text style={styles.sleepBadgeText}>{sleepTimer}m</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Queue')} style={styles.iconBtn}>
            <Ionicons name="list" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        {currentTrack.artwork
          ? <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          : (
            <View style={styles.artworkPlaceholder}>
              <Ionicons name="musical-note" size={80} color="#1DB954" />
            </View>
          )}
      </View>

      {/* Info */}
      <View style={styles.infoRow}>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </View>

      {/* Seek bar */}
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

      {/* Controls */}
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
          {repeatMode === 'one' && <Text style={styles.repeatOne}>1</Text>}
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={styles.settingsSheet}>
            <Text style={styles.sheetTitle}>Player Settings</Text>

            <TouchableOpacity style={styles.settingRow} onPress={toggleNormalize}>
              <View>
                <Text style={styles.settingLabel}>Audio Normalization</Text>
                <Text style={styles.settingDesc}>Balance volume across tracks</Text>
              </View>
              <View style={[styles.toggle, normalizeAudio && styles.toggleOn]}>
                <View style={[styles.toggleThumb, normalizeAudio && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={toggleCrossfade}>
              <View>
                <Text style={styles.settingLabel}>Crossfade</Text>
                <Text style={styles.settingDesc}>Smooth transition between tracks</Text>
              </View>
              <View style={[styles.toggle, crossfadeEnabled && styles.toggleOn]}>
                <View style={[styles.toggleThumb, crossfadeEnabled && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => { setShowSettings(false); setShowSleep(true); }}>
              <View>
                <Text style={styles.settingLabel}>Sleep Timer</Text>
                <Text style={styles.settingDesc}>{sleepTimer ? `Stops in ${sleepTimer} min` : 'Auto-stop music'}</Text>
              </View>
              <Ionicons name="moon-outline" size={22} color={sleepTimer ? '#1DB954' : '#666'} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal visible={showSleep} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSleep(false)}>
          <View style={styles.settingsSheet}>
            <Text style={styles.sheetTitle}>Sleep Timer</Text>
            {SLEEP_OPTIONS.map(min => (
              <TouchableOpacity key={min} style={styles.sleepOption} onPress={() => { startSleepTimer(min); setShowSleep(false); }}>
                <Text style={[styles.sleepOptionText, sleepTimer === min && styles.sleepOptionActive]}>{min} minutes</Text>
                {sleepTimer === min && <Ionicons name="checkmark" size={18} color="#1DB954" />}
              </TouchableOpacity>
            ))}
            {sleepTimer && (
              <TouchableOpacity style={styles.sleepOption} onPress={() => { cancelSleepTimer(); setShowSleep(false); }}>
                <Text style={[styles.sleepOptionText, { color: '#e74c3c' }]}>Cancel Timer</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { padding: 4 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  sleepBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1a1a2e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sleepBadgeText: { color: '#1DB954', fontSize: 12, fontWeight: '600' },
  artworkContainer: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  artwork: { width: width - 80, height: width - 80, borderRadius: 16 },
  artworkPlaceholder: { width: width - 80, height: width - 80, borderRadius: 16, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  artist: { color: '#888', fontSize: 16, marginTop: 4 },
  sliderContainer: { marginBottom: 24 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  time: { color: '#666', fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#666', fontSize: 16 },
  repeatOne: { color: '#1DB954', fontSize: 9, textAlign: 'center', marginTop: -4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  settingsSheet: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 4 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  settingLabel: { color: '#fff', fontSize: 15, fontWeight: '500' },
  settingDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#333', justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: '#1DB954' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  sleepOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  sleepOptionText: { color: '#fff', fontSize: 15 },
  sleepOptionActive: { color: '#1DB954', fontWeight: '600' },
});

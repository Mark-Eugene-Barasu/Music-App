import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
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
    qualityMode, cycleQualityMode,
    sleepTimer, startSleepTimer, cancelSleepTimer,
  } = usePlayer();
  const { palette } = useTheme();

  const [showSettings, setShowSettings] = useState(false);
  const [showSleep, setShowSleep] = useState(false);

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.empty}>
          <Ionicons name="musical-notes" size={64} color={palette.bg3} />
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>Nothing playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const repeatIcon = repeatMode === 'one' ? 'repeat-outline' : 'repeat';
  const repeatColor = repeatMode === 'none' ? palette.textMuted : palette.accent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={28} color={palette.text} />
        </TouchableOpacity>
        <View style={styles.topActions}>
          {sleepTimer && (
            <TouchableOpacity onPress={cancelSleepTimer} style={[styles.sleepBadge, { backgroundColor: palette.bg2 }]}>
              <Ionicons name="moon" size={14} color={palette.accent} />
              <Text style={[styles.sleepBadgeText, { color: palette.accent }]}>{sleepTimer}m</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Lyrics')} style={styles.iconBtn}>
            <Ionicons name="text" size={20} color={palette.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Queue')} style={styles.iconBtn}>
            <Ionicons name="list" size={22} color={palette.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color={palette.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.artworkContainer}>
        {currentTrack.artwork
          ? <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
          : (
            <View style={[styles.artworkPlaceholder, { backgroundColor: palette.bg2 }]}>
              <Ionicons name="musical-note" size={80} color={palette.accent} />
            </View>
          )}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.artist, { color: palette.textSub }]} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor={palette.accent}
          maximumTrackTintColor={palette.bg3}
          thumbTintColor={palette.accent}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: palette.textMuted }]}>{formatTime(position)}</Text>
          <Text style={[styles.time, { color: palette.textMuted }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Ionicons name="shuffle" size={24} color={isShuffled ? palette.accent : palette.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipPrev}>
          <Ionicons name="play-skip-back" size={36} color={palette.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: palette.accent }]}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipNext}>
          <Ionicons name="play-skip-forward" size={36} color={palette.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleRepeat}>
          <Ionicons name={repeatIcon} size={24} color={repeatColor} />
          {repeatMode === 'one' && <Text style={[styles.repeatOne, { color: palette.accent }]}>1</Text>}
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={[styles.settingsSheet, { backgroundColor: palette.card }]}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>Player Settings</Text>

            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: palette.border }]} onPress={toggleNormalize}>
              <View>
                <Text style={[styles.settingLabel, { color: palette.text }]}>Audio Normalization</Text>
                <Text style={[styles.settingDesc, { color: palette.textMuted }]}>Balance volume across tracks</Text>
              </View>
              <View style={[styles.toggle, { backgroundColor: normalizeAudio ? palette.accent : palette.bg3 }]}>
                <View style={[styles.toggleThumb, normalizeAudio && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: palette.border }]} onPress={toggleCrossfade}>
              <View>
                <Text style={[styles.settingLabel, { color: palette.text }]}>Crossfade</Text>
                <Text style={[styles.settingDesc, { color: palette.textMuted }]}>Smooth transition between tracks</Text>
              </View>
              <View style={[styles.toggle, { backgroundColor: crossfadeEnabled ? palette.accent : palette.bg3 }]}>
                <View style={[styles.toggleThumb, crossfadeEnabled && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: palette.border }]} onPress={cycleQualityMode}>
              <View>
                <Text style={[styles.settingLabel, { color: palette.text }]}>Audio Quality</Text>
                <Text style={[styles.settingDesc, { color: palette.textMuted }]}>
                  {qualityMode === 'saver' ? 'Data Saver — lower bitrate' : qualityMode === 'hires' ? 'Hi-Res — lossless quality' : 'Normal — balanced'}
                </Text>
              </View>
              <Text style={{ color: palette.accent, fontWeight: '700', fontSize: 13 }}>
                {qualityMode === 'saver' ? 'SAVER' : qualityMode === 'hires' ? 'HI-RES' : 'NORMAL'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: palette.border }]} onPress={() => { setShowSettings(false); setShowSleep(true); }}>
              <View>
                <Text style={[styles.settingLabel, { color: palette.text }]}>Sleep Timer</Text>
                <Text style={[styles.settingDesc, { color: palette.textMuted }]}>{sleepTimer ? `Stops in ${sleepTimer} min` : 'Auto-stop music'}</Text>
              </View>
              <Ionicons name="moon-outline" size={22} color={sleepTimer ? palette.accent : palette.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: 'transparent' }]} onPress={() => { setShowSettings(false); navigation.navigate('Settings'); }}>
              <View>
                <Text style={[styles.settingLabel, { color: palette.text }]}>Appearance</Text>
                <Text style={[styles.settingDesc, { color: palette.textMuted }]}>Theme color & dark/light mode</Text>
              </View>
              <Ionicons name="color-palette-outline" size={22} color={palette.accent} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal visible={showSleep} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSleep(false)}>
          <View style={[styles.settingsSheet, { backgroundColor: palette.card }]}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>Sleep Timer</Text>
            {SLEEP_OPTIONS.map(min => (
              <TouchableOpacity key={min} style={[styles.sleepOption, { borderBottomColor: palette.border }]} onPress={() => { startSleepTimer(min); setShowSleep(false); }}>
                <Text style={[styles.sleepOptionText, { color: palette.text }, sleepTimer === min && { color: palette.accent, fontWeight: '600' }]}>{min} minutes</Text>
                {sleepTimer === min && <Ionicons name="checkmark" size={18} color={palette.accent} />}
              </TouchableOpacity>
            ))}
            {sleepTimer && (
              <TouchableOpacity style={[styles.sleepOption, { borderBottomColor: 'transparent' }]} onPress={() => { cancelSleepTimer(); setShowSleep(false); }}>
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
  container: { flex: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backBtn: { padding: 4 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  sleepBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  sleepBadgeText: { fontSize: 12, fontWeight: '600' },
  artworkContainer: { alignItems: 'center', marginTop: 12, marginBottom: 32 },
  artwork: { width: width - 80, height: width - 80, borderRadius: 16 },
  artworkPlaceholder: { width: width - 80, height: width - 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  info: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  artist: { fontSize: 16, marginTop: 4 },
  sliderContainer: { marginBottom: 24 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  time: { fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  playBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16 },
  repeatOne: { fontSize: 9, textAlign: 'center', marginTop: -4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  settingsSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 4 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  sleepOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  sleepOptionText: { fontSize: 15 },
});

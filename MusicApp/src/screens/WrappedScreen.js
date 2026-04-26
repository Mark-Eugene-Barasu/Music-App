import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStats } from '../context/StatsContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/formatTime';

const { width } = Dimensions.get('window');
const BAR_MAX_W = width - 160;

function BarRow({ label, sub, value, maxValue, color }) {
  const barW = maxValue > 0 ? (value / maxValue) * BAR_MAX_W : 0;
  const { palette } = useTheme();
  return (
    <View style={styles.barRow}>
      <View style={styles.barLabel}>
        <Text style={[styles.barTitle, { color: palette.text }]} numberOfLines={1}>{label}</Text>
        {sub ? <Text style={[styles.barSub, { color: palette.textSub }]} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <View style={[styles.barTrack, { backgroundColor: palette.bg2 }]}>
        <View style={[styles.barFill, { width: barW, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barValue, { color: palette.textSub }]}>{value}</Text>
    </View>
  );
}

export default function WrappedScreen({ navigation }) {
  const { getWrapped } = useStats();
  const { createPlaylist, addTrackToPlaylist } = usePlaylists();
  const { palette } = useTheme();
  const { topTracks, topArtists, totalMs, totalPlays } = getWrapped();

  const [showBlend, setShowBlend] = useState(false);
  const [blendName, setBlendName] = useState('');

  const maxTrackPlays = topTracks[0]?.count ?? 1;
  const maxArtistPlays = topArtists[0]?.count ?? 1;

  function createBlend() {
    if (!blendName.trim()) return;
    const blended = [...topTracks.slice(0, 5)].sort(() => Math.random() - 0.5);
    const p = createPlaylist(`🎵 Blend: ${blendName.trim()}`);
    blended.forEach(t => addTrackToPlaylist(p.id, t.id));
    setShowBlend(false);
    setBlendName('');
    Alert.alert('Blend Created!', `"${p.name}" added to your playlists.`);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>Your Wrapped</Text>
        <TouchableOpacity onPress={() => setShowBlend(true)}>
          <Ionicons name="people" size={22} color={palette.accent} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: palette.card }]}>
                <Text style={[styles.statNum, { color: palette.accent }]}>{totalPlays}</Text>
                <Text style={[styles.statLabel, { color: palette.textSub }]}>Total Plays</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: palette.card }]}>
                <Text style={[styles.statNum, { color: palette.accent }]}>{formatTime(totalMs)}</Text>
                <Text style={[styles.statLabel, { color: palette.textSub }]}>Time Listened</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: palette.text }]}>Top Tracks</Text>
            {topTracks.length === 0
              ? <Text style={[styles.empty, { color: palette.textMuted }]}>Play some songs to see your stats!</Text>
              : topTracks.map((t, i) => (
                <BarRow key={t.id} label={`#${i + 1} ${t.title}`} sub={t.artist} value={t.count} maxValue={maxTrackPlays} color={i === 0 ? palette.accent : palette.bg3} />
              ))}

            <Text style={[styles.sectionTitle, { color: palette.text }]}>Top Artists</Text>
            {topArtists.length === 0
              ? <Text style={[styles.empty, { color: palette.textMuted }]}>No data yet</Text>
              : topArtists.map((a, i) => (
                <BarRow key={a.artist} label={`#${i + 1} ${a.artist}`} value={a.count} maxValue={maxArtistPlays} color={i === 0 ? palette.accent : palette.bg3} />
              ))}

            <TouchableOpacity style={[styles.blendBtn, { backgroundColor: palette.accent }]} onPress={() => setShowBlend(true)}>
              <Ionicons name="people" size={18} color="#000" />
              <Text style={styles.blendBtnText}>Create a Blend</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Modal visible={showBlend} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: palette.card }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>🎵 Create a Blend</Text>
            <Text style={[styles.modalSub, { color: palette.textSub }]}>Enter a friend's name to create a shared playlist from your top tracks.</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: palette.bg, color: palette.text }]}
              placeholder="Friend's name"
              placeholderTextColor={palette.textMuted}
              value={blendName}
              onChangeText={setBlendName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowBlend(false)} style={styles.modalCancel}>
                <Text style={[styles.modalCancelText, { color: palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createBlend} style={[styles.modalCreate, { backgroundColor: palette.accent }]}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 8, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, padding: 20, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 10 },
  barLabel: { width: 100 },
  barTitle: { fontSize: 12, fontWeight: '600' },
  barSub: { fontSize: 11, marginTop: 1 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { fontSize: 12, width: 28, textAlign: 'right' },
  empty: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },
  blendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 28, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, alignSelf: 'center' },
  blendBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modal: { borderRadius: 16, padding: 24, width: '85%', gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 13, lineHeight: 18 },
  modalInput: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 8 },
  modalCancelText: { fontSize: 15 },
  modalCreate: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  modalCreateText: { color: '#000', fontWeight: '700', fontSize: 15 },
});

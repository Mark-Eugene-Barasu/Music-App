import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStats } from '../context/StatsContext';
import { formatTime } from '../utils/formatTime';

export default function WrappedScreen({ navigation }) {
  const { getWrapped } = useStats();
  const { topTracks, topArtists, totalMs, totalPlays } = getWrapped();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Wrapped</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{totalPlays}</Text>
                <Text style={styles.statLabel}>Total Plays</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{formatTime(totalMs)}</Text>
                <Text style={styles.statLabel}>Time Listened</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Top Tracks</Text>
            {topTracks.length === 0
              ? <Text style={styles.empty}>Play some songs to see your stats!</Text>
              : topTracks.map((t, i) => (
                <View key={t.id} style={styles.row}>
                  <Text style={styles.rank}>#{i + 1}</Text>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.rowSub}>{t.artist}</Text>
                  </View>
                  <Text style={styles.plays}>{t.count} plays</Text>
                </View>
              ))}

            <Text style={styles.sectionTitle}>Top Artists</Text>
            {topArtists.length === 0
              ? <Text style={styles.empty}>No data yet</Text>
              : topArtists.map((a, i) => (
                <View key={a.artist} style={styles.row}>
                  <Text style={styles.rank}>#{i + 1}</Text>
                  <Text style={styles.rowTitle}>{a.artist}</Text>
                  <Text style={styles.plays}>{a.count} plays</Text>
                </View>
              ))}
          </View>
        }
        renderItem={null}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 8, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, alignItems: 'center' },
  statNum: { color: '#1DB954', fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#888', fontSize: 13, marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  rank: { color: '#1DB954', fontWeight: '700', fontSize: 16, width: 36 },
  rowInfo: { flex: 1 },
  rowTitle: { color: '#fff', fontSize: 14, fontWeight: '500' },
  rowSub: { color: '#666', fontSize: 12, marginTop: 2 },
  plays: { color: '#555', fontSize: 12 },
  empty: { color: '#555', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
});

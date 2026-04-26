import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/formatTime';

export default function QueueScreen({ navigation }) {
  const { queue, currentIndex, removeFromQueue, loadAndPlay } = usePlayer();
  const { palette } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>Queue</Text>
        <View style={{ width: 26 }} />
      </View>
      <FlatList
        data={queue}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: palette.border }, index === currentIndex && { backgroundColor: palette.bg2 }]}
            onPress={() => loadAndPlay(item, queue, index)}
          >
            <View style={styles.itemLeft}>
              {index === currentIndex
                ? <Ionicons name="musical-note" size={16} color={palette.accent} style={styles.icon} />
                : <Text style={[styles.indexText, { color: palette.textMuted }]}>{index + 1}</Text>}
              <View>
                <Text style={[styles.trackTitle, { color: index === currentIndex ? palette.accent : palette.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.artist, { color: palette.textSub }]} numberOfLines={1}>{item.artist}</Text>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.duration, { color: palette.textMuted }]}>{formatTime(item.duration)}</Text>
              {index !== currentIndex && (
                <TouchableOpacity onPress={() => removeFromQueue(index)} style={styles.removeBtn}>
                  <Ionicons name="close" size={18} color={palette.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: palette.textMuted }]}>Queue is empty</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { marginRight: 12 },
  indexText: { fontSize: 13, width: 28 },
  trackTitle: { fontSize: 14, fontWeight: '500', maxWidth: 220 },
  artist: { fontSize: 12, marginTop: 2 },
  duration: { fontSize: 12 },
  removeBtn: { padding: 4 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 15 },
});
